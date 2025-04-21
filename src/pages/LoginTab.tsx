import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonLoading, IonToast, IonIcon } from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useHistory } from 'react-router-dom';
import { useRol } from '../context/RoleContext';
import { getFirestore, collection, query, where, getDocs} from 'firebase/firestore';

const LoginTab: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();
  const { setRol } = useRol();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Usuario autenticado: ", user);
  
      if (!user) {
        throw new Error('Usuario no autenticado correctamente');
      }
  
      const db = getFirestore();
      const rolRef = collection(db, 'roluser'); 
      const q = query(rolRef, where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
      
        const rol = data.rol;
      
        setRol(rol);
        console.log("🔎 Datos completos del documento:", data);
        history.push('/menu');
      } else {
        console.warn('⚠️ No se encontró el documento del usuario (Google)');
        setRol(""); // Valor por defecto
      }
  
      // Siempre redirige después del login
      history.push('/menu');
    } catch (error: any) {
      console.error('❌ Error en el flujo de Google Login:', error.message);
  
      if (error.message !== 'Missing or insufficient permissions') {
        setError('Error al autenticar con Google');
        setShowToast(true);
      }
    }
  };
  
  
  

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      setShowToast(true);
      return;
    }
  
    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido');
      setShowToast(true);
      return;
    }
  
    setShowLoading(true);
    setError('');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 👇 CONSULTAR FIRESTORE PARA OBTENER EL ROL
      const db = getFirestore();
      const rolRef = collection(db, 'roluser');
      const q = query(rolRef, where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const rol = doc.data().rol;
        setRol(rol); // 👈 Guardar rol en el contexto
        console.log("🔎 Datos completos del documento:", data);
        history.push('/menu');
      } else {
        console.warn('No se encontró el rol del usuario');
        setRol("");
      }
  
      history.push('/menu'); // Redirige después de todo
    } catch (err: any) {
      setError(err.message);
      setShowToast(true);
      console.error('Error al iniciar sesión:', err);
    } finally {
      setShowLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <IonItem>
            <IonLabel position="floating">Correo Electrónico</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={e => setEmail(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Contraseña</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={e => setPassword(e.detail.value!)}
            />
          </IonItem>

          <IonButton
            expand="block"
            onClick={handleLogin}
            className="ion-margin-top"
          >
            Iniciar Sesión
          </IonButton>

          {/* Reemplaza el botón actual de registro por este */}
          <IonButton
            expand="block"
            fill="clear"
            routerLink="/register" // Usa routerLink en lugar de onClick
          >
            ¿No tienes cuenta? Regístrate
          </IonButton>

          <IonButton
            expand="block"
            color="light"
            onClick={handleGoogleLogin}
          >
            <IonIcon icon={logoGoogle} slot="start" />
            Continuar con Google
          </IonButton>
        </div>

        <IonLoading isOpen={showLoading} message={'Iniciando sesión...'} />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginTab;