const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// Needs to load profile
const topImports = `import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Profile } from "../types";
import { Github, Linkedin, Mail, Heart, Phone, MapPin } from "lucide-react";`;

content = content.replace(/import { Link } from "react-router-dom";\nimport { Github, Linkedin, Mail, Heart, Phone, MapPin } from "lucide-react";/, topImports);

// Inside Footer component
const initProfile = `export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getDoc(doc(db, "profile", "main")).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data() as Profile);
      }
    });
  }, []);`;

content = content.replace(/export default function Footer\(\) \{\n  const currentYear = new Date\(\)\.getFullYear\(\);/, initProfile);

// Update placeholders
content = content.replace(/mahantatusharranjan2007@gmail\.com/g, '{profile?.email || "tusharranjan@example.com"}');
content = content.replace(/"mailto:\{profile\?\.email/g, '{"mailto:" + (profile?.email');
content = content.replace(/\|\| "tusharranjan@example.com"}"/, '|| "tusharranjan@example.com")}');

content = content.replace(/\+1 \(555\) 0199-341/g, '{profile?.whatsapp || "+1 (555) 000-0000"}');
content = content.replace(/San Francisco, CA/g, '{profile?.location || "San Francisco, CA"}');

content = content.replace(/"https:\/\/github\.com\/mahantapurna"/, '{profile?.github || "https://github.com"}');
content = content.replace(/"https:\/\/linkedin\.com\/in\/mahanta"/, '{profile?.linkedin || "https://linkedin.com"}');

fs.writeFileSync('src/components/Footer.tsx', content);
