import { Injectable, NgZone, Signal, WritableSignal, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "./user";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/compat/firestore"
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Injectable({
  providedIn:"root"
})
export class AuthService{
    userData: WritableSignal<User | null>;

    constructor(
        public afs: AngularFirestore,
        public afAuth: AngularFireAuth,
        public ngZone: NgZone,
        public router: Router
    ){  
        this.userData = signal(null)
        
        this.afAuth.authState.subscribe((user) => {
            if (user) {
              this.userData.set(user);
              localStorage.setItem('user', JSON.stringify(this.userData));
              JSON.parse(localStorage.getItem('user')!);
            } else {
              localStorage.setItem('user', 'null');
              JSON.parse(localStorage.getItem('user')!);
            }
          });
    }

    SignIn(email: string, password: string) {
        return this.afAuth
          .signInWithEmailAndPassword(email, password)
          .then((result) => {
            this.SetUserData(result.user);
            this.afAuth.authState.subscribe((user) => {
              if (user) {
                this.router.navigate(['dashboard']);
              }
            });
          })
          .catch((error) => {
            window.alert(error.message);
          });
      }
      // Sign up with email/password
      SignUp(email: string, password: string) {
        return this.afAuth
          .createUserWithEmailAndPassword(email, password)
          .then((result) => {
            /* Call the SendVerificaitonMail() function when new user sign 
            up and returns promise */
            this.SendVerificationMail();
            this.SetUserData(result.user);
          })
          .catch((error) => {
            window.alert(error.message);
          });
      }
      // Send email verfificaiton when new user sign up
      SendVerificationMail() {
        return this.afAuth.currentUser
          .then((u: any) => u.sendEmailVerification())
          .then(() => {
            this.router.navigate(['verify-email-address']);
          });
      }
      // Reset Forggot password
      ForgotPassword(passwordResetEmail: string) {
        return this.afAuth
          .sendPasswordResetEmail(passwordResetEmail)
          .then(() => {
            window.alert('Password reset email sent, check your inbox.');
          })
          .catch((error) => {
            window.alert(error);
          });
      }
      // Returns true when user is looged in and email is verified
      get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user')!);
        return user !== null && user.emailVerified !== false ? true : false;
      }
      /* Setting up user data when sign in with username/password, 
      sign up with username/password and sign in with social auth  
      provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
      SetUserData(user: any) {
        const userRef: AngularFirestoreDocument<User> = this.afs.doc(
          `users/${user.uid}`
        );
        const data: User = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        };

        this.userData.set(data);

        return userRef.set(data, {
          merge: true,
        });

        
      }
      // Sign out
      SignOut() {
        return this.afAuth.signOut().then(() => {
          localStorage.removeItem('user');
          // this.router.navigate(['sign-in']);
        });
      }
}