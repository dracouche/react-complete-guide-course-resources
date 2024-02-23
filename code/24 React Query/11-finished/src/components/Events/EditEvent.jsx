import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {
  fetchEvent,
  updateEvent,
  queryClient,
} from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation(); // permet de connaitre l'etat sur la navigation actuelle (ex : attente de submit)
  const submit = useSubmit(); // permet d'envoyer les données de formulaire et de les intercepter par react rooter
  const params = useParams();

  /**
   * Envoyer des données : useMutation, en recevoir : useQuery
   * @data : le resultat de la requete qui sont récupérés automatiquement
   * @isPending : return true si la requete est en attente, false si elle est achevée
   * @isError : return true si l'api retourne une erreur
   * @error : contiens les informations de l'erreur
   * @param queryKey : tag assignés a ces données pour différencier des autres données
   * (ex: quand on veut invalider certaines données)
   * @param queryFn : fonction API
   */
  const { data, isError, error } = useQuery({
    queryKey: ['events', params.id],
    /**
     * @param signal : on destructure signal qui permet d'arreter un appel api
     * eviter des requetes inutiles (ex: quand on change de page)
     * @param staleTime : verifie le cache et effectue la requete si les données date de plus de x secondes.
     * Dans notre cas, comme on execute la query en amont avec react router avant de charger le composant,
     * il n'est pas nécessaire d'envoyer aussi la meme requete directement quand le composant est montée.
     */
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000, // Si les données date de moins de 10 secondes, par besoin de verifier le cache et 
  });

  /**
   * Mutation optimisée pour eviter d'avoir un afficher un spinner en injectant mannuelement les données
   * en meme temps que l'appel api.
   * @param onMutate fonction declanchée a l'appel de la fonction mutate (donc avant d'avoir une réponse)
   * @param onError fonction declanché lors d'une erreur avec l'api.
   * Permet ici de remettre les données initiales si la requete echoue
   *      @param error : l'erreur
   *      @param data : les donnnées envoyées
   *      @param context : Le contexte avec les informations retournées par onMutate
   * @param onSetteld : fonction declanchée a la fin de l'appel de l'api, qu'il soit reussi ou non
   * Permet ici de s'assurer que les données sont a jour avec le back end dans le cas d'une erreur par exemple
   */
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event;

  /**
   * Permet d'annuler les query declanchee avec useQuery portant le tag concerné.
   * Permet ici d'eviter tout conflits avec de potentielles query entrante
   * comme les données sont mises a jour manuellement avec setQueryData
   * @param queryKey : les query portant le tag renseigné
   */
  //     await queryClient.cancelQueries({ queryKey: ['events', params.id] });
  /**
   * Permet de recuperer les données de la requete actuellement stockée pourtant le tag concerné.
   * Dans notre cas, ça sert a eviter de mettre a jour les données avec setQueryData si il y a eu une erreur
   * du cote du back, et de pouvoir remettre les données actuelle.
   * @param queryKey : les query portant le tag renseigné
   */
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);

  /**
   * Modifie les données des query avec le tag renseigné.
   * @param param1 : les query portant le tag renseigné
   * @param param2 : les nouvelles données de la query
   */
  //     queryClient.setQueryData(['events', params.id], newEvent);

  //     return { previousEvent };
  //   },

  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(['events', params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            'Failed to load event. Please check your inputs and try again later.'
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

/**
 * Permet d'executer la fonction avant que le composant ne soit rendu 
 */
export function loader({ params }) {
  /**
   * Permet de trigger une query
   */
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

/**
 * Fonction declenchée quand submit() est appelé
 */
export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(['events']);
  return redirect('../');
}
