import { useState } from 'react';
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import {
  fetchEvent,
  deleteEvent,
  queryClient,
} from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  /**
   * Envoyer des données : useMutation, en recevoir : useQuery
   * @data : le resultat de la requete qui sont récupérés automatiquement
   * @isPending : return true si la requete est en attente, false si elle est achevée
   * @isError : return true si l'api retourne une erreur
   * @error : contiens les informations de l'erreur
   * @param queryKey : tag assignés a ces données pour différencier des autres données
   * (ex: quand on veut invalider certaines données)
   * @param queryFn : fonction API, on destructure signal qui permet d'arreter un appel api
   * pour eviter des requetes inutiles (ex: quand on change de page)
   */
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  /**
   * Envoyer des données : useMutation, en recevoir : useQuery
   * @mutate : permet d'envoyer la requete
   * @isPending : return true si la requete est en attente, false si elle est achevée
   * @isError : return true si l'api retourne une erreur
   * @error : contiens les informations de l'erreur
   * @param mutationFn : fonction API
   * @param onSuccess : () => {} fonction a executer une fois l'appel api reussi
   */
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      /**
       * Invalide les données en cache des query avec le tag events.
       * Lance une récupération immédiate des données des composants affichés à l'écran.
       * @param queryKey : les query portant le tag renseigné
       * @param refetchType : 'none' pour eviter la récupération immédiate des données des composants affiché à l'écran
       * (ex: permet d'eviter de déclencher a nouveau la query de cet event qui vient d'etre supprimé)
       */
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none',
      });
      navigate('/events');
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            'Failed to fetch event data, please try again later.'
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString(
      'en-US',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img
            src={`http://localhost:3000/${data.image}`}
            alt={data.title}
          />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action
            cannot be undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting, please wait...</p>}
            {!isPendingDeletion && (
              <>
                <button
                  onClick={handleStopDelete}
                  className="button-text"
                >
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event"
              message={
                deleteError.info?.message ||
                'Failed to delete event, please try again later.'
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
