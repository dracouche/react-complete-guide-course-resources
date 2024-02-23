import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchEvents } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();

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
   * pour eviter des requetes inutiles (ex: quand on change de page) et queryKey[1] pour passer le parametre de recherche
   * a notre fonction
   */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', { searchTerm: searchTerm }], // Key pour mettre en cache les données
    queryFn: ({ signal, queryKey }) =>
      fetchEvents({ signal, ...queryKey[1] }),
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
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
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
