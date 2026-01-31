// app/(auth)/register.jsx
import { auth, db } from "@/components/lib/firabase";
import { Box, Button, Text } from "@/components/ui/theme";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useState } from "react";
import { registerSchema, useAuthForm } from "./fromValidator";
import { InputField } from "./inputField";
import { SelectField } from "./selectField";

export default function ResgisterComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useAuthForm(registerSchema, {
    role: "",
    invitationCode: "",
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // 1. Vérifier le code d'invitation si apprenant
      if (data.role === "learner") {
        const formationRef = doc(db, "formations");
        const q = query(
          formationRef,
          where("invitationCode", "==", data.invitationCode),
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          throw new Error("Code d'invitation invalide");
        }

        const formation = snapshot.docs[0].data();
        data.formationId = snapshot.docs[0].id;
        data.trainerId = formation.formateurId;
      }

      // 2. Créer l'utilisateur Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      // 3. Créer le document user dans Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        name: data.fullName,
        email: data.email,
        role: data.role,
        status: "active",
        ...(data.role === "learner" && {
          formationId: data.formationId,
          trainerId: data.trainerId,
        }),
        createdAt: new Date().toISOString(),
      });

      // 4. Redirection selon rôle
      router.replace(`/(tabs)/(${data.role})`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="background" padding="xl">
      <Box marginBottom="xl">
        <Text variant="hero" color="primary" textAlign="center">
          EduTrack
        </Text>
        <Text variant="title" textAlign="center" marginTop="s">
          Créer un compte
        </Text>
      </Box>

      <Box gap="m">
        <InputField
          control={control}
          name="fullName"
          label="Nom complet"
          placeholder="Votre nom"
          error={errors.fullName}
        />

        <InputField
          control={control}
          name="email"
          label="Email"
          placeholder="email@exemple.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <InputField
          control={control}
          name="password"
          label="Mot de passe"
          placeholder="Minimum 6 caractères"
          secureTextEntry
          error={errors.password}
        />

        <SelectField
          control={control}
          name="role"
          label="Vous êtes :"
          options={[
            { label: "👨‍🎓 Apprenant", value: "learner" },
            { label: "👨‍🏫 Formateur", value: "trainer" },
          ]}
          error={errors.role}
        />

        {selectedRole === "learner" && (
          <InputField
            control={control}
            name="invitationCode"
            label="Code d'invitation"
            placeholder="Obtenez-le auprès de votre formateur"
            error={errors.invitationCode}
          />
        )}

        {error && (
          <Box backgroundColor="red" padding="m" borderRadius="m">
            <Text color="white" textAlign="center">
              {error}
            </Text>
          </Box>
        )}

        <Button
          title={loading ? "Création..." : "S'inscrire"}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
          marginTop="m"
        />
      </Box>

      <Box alignItems="center" marginTop="xl">
        <Text variant="body" color="muted">
          Déjà un compte ?{" "}
          <Link
            href="/(auth)/login"
            style={{ color: "#2563EB", fontWeight: "600" }}
          >
            Se connecter
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
