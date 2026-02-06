// hooks/useAuthForm.js
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Schéma validation inscription
export const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Le nom est requis")
    .min(2, "Trop court")
    .max(50, "Trop long"),

  email: yup.string().required("Email requis").email("Email invalide"),

  password: yup
    .string()
    .required("Mot de passe requis")
    .min(6, "Minimum 6 caractères"),

  role: yup
    .string()
    .required("Sélectionnez un rôle")
    .oneOf(["learner", "trainer"], "Rôle invalide"),

  invitationCode: yup.string().when("role", {
    is: "learner",
    then: (schema) => schema.required("Code d'invitation requis"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

// Schéma validation connexion
export const loginSchema = yup.object({
  email: yup.string().required("Email requis").email("Email invalide"),

  password: yup.string().required("Mot de passe requis"),
});

export const useAuthForm = (schema, defaultValues = {}) => {
  return useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: "onChange",
  });
};

// ForgotPasswordComponent.tsx (version mise à jour)
export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Email invalide").required("Email requis"),
});
