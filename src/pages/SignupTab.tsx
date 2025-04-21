import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonLoading, IonToast, IonBackButton, IonButtons } from '@ionic/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useHistory } from 'react-router-dom';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'; // 👈 Firestore

const SignUpTab: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setShowToast(true);
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido');
      setShowToast(true);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setShowToast(true);
      return;
    }

    setShowLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 👇 Agregar usuario a Firestore con rol "user"
      const db = getFirestore();
      const rolRef = doc(collection(db, 'roluser'), user.uid);
      await setDoc(rolRef, {
        user_id: user.uid,
        rol: 'user',
        email: user.email,
        createdAt: new Date()
      });

      history.push('/login'); // Redirige después del registro
    } catch (err: any) {
      let errorMessage = 'Error al registrar';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo ya está registrado';
      }
      setError(errorMessage);
      setShowToast(true);
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registro</IonTitle>
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

          <IonItem>
            <IonLabel position="floating">Confirmar Contraseña</IonLabel>
            <IonInput 
              type="password" 
              value={confirmPassword} 
              onIonChange={e => setConfirmPassword(e.detail.value!)} 
            />
          </IonItem>
          
          <IonButton 
            expand="block" 
            onClick={handleSignUp} 
            className="ion-margin-top"
          >
            Registrarse
          </IonButton>
        </div>

        <IonLoading isOpen={showLoading} message={'Registrando usuario...'} />
        
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

export default SignUpTab;
