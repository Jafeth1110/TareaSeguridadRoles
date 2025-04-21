import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

interface Documento {
  id: string;
  email?: string;
  rol?: string;
  user_id?: string;
  date?: string;
}

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      console.log('[DEBUG] Iniciando la carga de documentos desde Firestore...');

      try {
        const querySnapshot = await getDocs(collection(db, 'roluser'));
        console.log('[DEBUG] Documentos obtenidos:', querySnapshot.size);

        const docsArray: Documento[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('[DEBUG] Documento leído:', { id: doc.id, ...data });
          docsArray.push({ id: doc.id, ...data } as Documento);
        });

        if (isMounted) {
          setDocs(docsArray);
          console.table(docsArray);
        }
      } catch (err) {
        if (isMounted) {
          setError('Error al cargar los documentos.');
          console.error('[ERROR] Error al cargar los documentos:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[DEBUG] Finalizada la carga de documentos.');
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
      console.log('[DEBUG] Componente desmontado, se cancela actualización de estado.');
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Documentos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner />
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : docs.length === 0 ? (
          <IonText>No hay documentos para mostrar.</IonText>
        ) : (
          <IonList>
            {docs.map((doc) => (
              <IonItem key={doc.id} routerLink={`/documents/${doc.id}`}>
                <IonLabel>
                  <h2>{doc.id || 'Sin id'}</h2>
                  <p>{doc.email || 'Sin email'}</p>
                  <p>{doc.rol || 'Sin rol'}</p>
                  <p>{doc.user_id || 'Sin id'}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DocumentsPage;
