import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonToast,
  IonAvatar,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonNote
} from '@ionic/react';
import {
  logOutOutline,
  personCircleOutline,
  settingsOutline,
  notificationsOutline,
  helpCircleOutline,
  mailOutline,
  calendarOutline,
  documentTextOutline,
  timeOutline,
  analyticsOutline,
  peopleOutline,
  cloudOfflineOutline
} from 'ionicons/icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useHistory } from 'react-router-dom';
import { useRol } from '../context/RoleContext';

const MenuTab: React.FC = () => {
  const history = useHistory();
  const user = auth.currentUser;
  const { rol } = useRol();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    if (!auth.currentUser) {
      history.replace('/login');
    }
  }, [history]);

  if (!auth.currentUser) {
    return null; // O un componente de carga
  }

  // Verificador de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    if (!isOnline) {
      setErrorMessage('Se requiere conexión a internet para cerrar sesión');
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      await signOut(auth);
      // Limpieza adicional para asegurar el logout completo
      window.localStorage.removeItem(`firebase:authUser:${import.meta.env.VITE_FIREBASE_API_KEY}:[DEFAULT]`);
      history.push('/Login');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      setErrorMessage(`Error al cerrar sesión: ${error.message}`);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Formateador de fecha para el último sync
  const formatLastSync = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleLogout} disabled={loading}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Menú Principal</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/profile">
              <IonAvatar slot="icon-only" style={{ width: '32px', height: '32px' }}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <IonIcon icon={personCircleOutline} style={{ fontSize: '32px' }} />
                )}
              </IonAvatar>
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {loading && <IonProgressBar type="indeterminate" color="warning" />}
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Estado de conexión */}
        {!isOnline && (
          <IonCard color="warning">
            <IonCardContent>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="2">
                    <IonIcon icon={cloudOfflineOutline} style={{ fontSize: '24px' }} />
                  </IonCol>
                  <IonCol>
                    <IonText color="dark">Modo offline - Última sincronización: {formatLastSync(lastSync)}</IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}

        {/* Tarjeta de bienvenida */}
        <IonCard color="light">
          <IonCardHeader>
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="3">
                  <IonAvatar style={{ width: '64px', height: '64px' }}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" />
                    ) : (
                      <IonIcon icon={personCircleOutline} style={{ fontSize: '64px' }} />
                    )}
                  </IonAvatar>
                </IonCol>
                <IonCol>
                  <IonCardTitle>¡Hola {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}!</IonCardTitle>
                  <IonNote>{user?.email}</IonNote>
                </IonCol>
                <IonText color="medium">Tu rol es: {rol}</IonText>
              </IonRow>
            </IonGrid>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonButton expand="block" fill="outline" routerLink="/stats">
                    <IonIcon slot="start" icon={analyticsOutline} />
                    Estadísticas
                  </IonButton>
                </IonCol>
                <IonCol>
                  <IonButton expand="block" fill="outline" routerLink="/team">
                    <IonIcon slot="start" icon={peopleOutline} />
                    Equipo
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Lista de opciones principales */}
        <IonList lines="full" className="ion-margin-top">
          <IonItem button routerLink="/notifications" detail>
            <IonIcon slot="start" icon={notificationsOutline} color="primary" />
            <IonLabel>Notificaciones</IonLabel>
            <IonBadge color="danger">3</IonBadge>
          </IonItem>

          <IonItem button routerLink="/calendar" detail>
            <IonIcon slot="start" icon={calendarOutline} color="primary" />
            <IonLabel>Calendario</IonLabel>
          </IonItem>

          {rol === 'admin' && (
            <IonItem button routerLink="/documents" detail>
              <IonIcon slot="start" icon={documentTextOutline} color="primary" />
              <IonLabel>Documentos</IonLabel>
            </IonItem>
          )}


          <IonItem button routerLink="/messages" detail>
            <IonIcon slot="start" icon={mailOutline} color="primary" />
            <IonLabel>Mensajes</IonLabel>
            <IonBadge color="warning">5</IonBadge>
          </IonItem>
        </IonList>

        {/* Lista de configuración y ayuda */}
        <IonList lines="full" className="ion-margin-top">
          <IonItem button routerLink="/settings" detail>
            <IonIcon slot="start" icon={settingsOutline} color="medium" />
            <IonLabel>Configuración</IonLabel>
          </IonItem>

          <IonItem button routerLink="/help" detail>
            <IonIcon slot="start" icon={helpCircleOutline} color="medium" />
            <IonLabel>Ayuda y Soporte</IonLabel>
          </IonItem>
        </IonList>

        {/* Tarjeta de actividad reciente */}
        <IonCard className="ion-margin-top">
          <IonCardHeader>
            <IonCardTitle>Actividad Reciente</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonIcon slot="start" icon={timeOutline} color="success" />
                <IonLabel>
                  <h3>Reunión de equipo</h3>
                  <p>Hoy a las 15:00</p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon slot="start" icon={documentTextOutline} color="tertiary" />
                <IonLabel>
                  <h3>Documento aprobado</h3>
                  <p>Ayer a las 11:30</p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonButton expand="block" fill="clear" routerLink="/activity">
              Ver toda la actividad
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>

      <IonToast
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        message={errorMessage}
        duration={4000}
        color="danger"
        position="top"
        buttons={[
          {
            text: 'Ok',
            role: 'cancel'
          }
        ]}
      />
    </IonPage>
  );
};

export default MenuTab;