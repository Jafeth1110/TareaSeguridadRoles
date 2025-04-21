import { Redirect, Route } from 'react-router-dom';
import {
  IonAlert,
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import { auth } from './firebase';
import LoginTab from './pages/LoginTab';
import MenuTab from './pages/MenuTab';
import SignupTab from './pages/SignupTab';
import { RoleProvider } from './context/RoleContext';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import DocumentsPage from './pages/DocumentsPage';
import DocumentDetailPage from './pages/DocumentDetailPage';

setupIonicReact();

const App: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const removeFocus = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Quitamos el foco al cargar la app para evitar aria-hidden warnings
    removeFocus();

    return () => unsubscribe();
  }, []);

  const handleMenuTabClick = (e: CustomEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAlert(true);
    }
  };

  return (
      <IonApp>
        <RoleProvider>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/Login" component={LoginTab} />
                <Route exact path="/Register" component={SignupTab} />
                <Route
                  path="/menu"
                  render={() => {
                    removeFocus(); // quitamos foco al entrar a /menu
                    return user ? <MenuTab /> : <Redirect to="/login" />;
                  }}
                />
                <Route exact path="/">
                  {user ? <Redirect to="/menu" /> : <Redirect to="/login" />}
                </Route>
                <Route path="/documents" component={DocumentsPage} exact />
                <Route path="/documents/:id" component={DocumentDetailPage} exact />

              </IonRouterOutlet>

              {!loading && (
                <IonTabBar slot="bottom">
                  {!user && (
                    <>
                      <IonTabButton tab="login" href="/Login">
                        <IonIcon icon={triangle} />
                        <IonLabel>Login</IonLabel>
                      </IonTabButton>
                      <IonTabButton tab="register" href="/Register">
                        <IonIcon icon={square} />
                        <IonLabel>Register</IonLabel>
                      </IonTabButton>
                    </>
                  )}
                  {user && (
                    <IonTabButton tab="menu" href="/Menu" onClick={handleMenuTabClick}>
                      <IonIcon icon={ellipse} />
                      <IonLabel>Menu</IonLabel>
                    </IonTabButton>
                  )}
                </IonTabBar>
              )}
            </IonTabs>
          </IonReactRouter>

          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Acceso denegado"
            message="Necesitás iniciar sesión para acceder al menú."
            buttons={['OK']}
          />
        </RoleProvider>
      </IonApp>
  );
};

export default App;
