import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';

export default function NewEventsSection() {
  /**
   * Envoyer des données : useMutation, en recevoir : useQuery
   * @data : le resultat de la requete qui sont récupérés automatiquement
   * @isLoading : return true si la requete est en attente, false si elle est achevée
   * Différence entre isLoading et isPending :
   * Les deux etats servent a savoir si une requete est en cours et n'a pas encore abouti
   * isLoading ne sera pas a true si enabled = false
   * @isError : return true si l'api retourne une erreur
   * @error : contiens les informations de l'erreur
   * @param queryKey : tag assignés a ces données pour différencier des autres données
   * (ex: quand on veut invalider certaines données)
   * @param queryFn : fonction API, on destructure signal qui permet d'arreter un appel api
   * pour eviter des requetes inutiles (ex: quand on change de page) et queryKey pour recuperer des parametre 
   * a passer a notre fonction fetchEvents
   */
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { max: 3 }],
    queryFn: ({ signal, queryKey }) =>
      fetchEvents({ signal, ...queryKey[1] }),
    staleTime: 5000,
    // gcTime: 1000
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || 'Failed to fetch events.'}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
