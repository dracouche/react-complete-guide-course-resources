import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { queryClient } from '../../util/http.js';

export default function NewEvent() {
  const navigate = useNavigate();

  /** 
   * Envoyer des données : useMutation, en recevoir : useQuery
   * @mutate : permet d'envoyer la requete
   * @isPending : return true si la requete est en attente, false si elle est achevée
   * @isError : return true si l'api retourne une erreur
   * @error : contiens les informations de l'erreur
   * @param mutationFn : fonction API
   * @param onSuccess : () => {} fonction a executer une fois l'appel api reussi
  */
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
     /** 
       * Invalide les données en cache des query avec le tag events.
       * Lance une récupération immédiate des données des composants affichés à l'écran.
       * @param queryKey : les query portant le tag renseigné
       * @param exact: Cible uniquement les query qui on pour tag exact le ou lest tag renseigné
       */
      queryClient.invalidateQueries({ queryKey: ['events']/** exact: true */ });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            'Failed to create event. Please check your inputs and try again later.'
          }
        />
      )}
    </Modal>
  );
}
