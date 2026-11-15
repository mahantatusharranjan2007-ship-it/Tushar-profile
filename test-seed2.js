import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json"));

const app = initializeApp(firebaseConfig);
const dbId = firebaseConfig.firestoreDatabaseId;
const db = initializeFirestore(app, {}, dbId);

async function test() {
  try {
    const docRef = doc(db, "profile", "main");
    const snap = await getDoc(docRef);
    console.log("Success! Exists:", snap.exists());
    const querySnapshot = await getDocs(collection(db, "announcements"));
    console.log("Announcements count:", querySnapshot.size);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
test();
