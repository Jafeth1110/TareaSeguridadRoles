import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

interface Documento {
  id?: string;
  email?: string;
  rol?: string;
  user_id?: string;
  date?: string;
}

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Documento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      try {
        const docRef = doc(db, 'roluser', id);
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDocument({ id: docSnap.id, ...data } as Documento); // Guardamos la data completa, incluyendo el id
          } else {
            setError('El documento no existe.');
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Error al obtener el documento.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalle del Documento</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner />
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : document ? (
          <>
            <h2>{document.id || 'Sin título'}</h2>
            <p>{document.email || 'Sin email'}</p>
            <p>{document.rol || 'Sin rol'}</p>
            <p>{document.user_id || 'Sin ID de usuario'}</p>
          </>
        ) : (
          <IonText>No se encontró el documento</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DocumentDetailPage;
