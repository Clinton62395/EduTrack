import * as yup from "yup";

// ─────────────────────────────────────────
// Schéma création
// ✅ status retiré — géré par publishTraining uniquement
// ─────────────────────────────────────────
export const trainingSchema = yup.object().shape({
  title: yup
    .string()
    .min(5, "Titre trop court (min 5 caractères)")
    .required("Titre requis"),
  description: yup.string().required("Description requise"),
  category: yup.string().required("Catégorie requise"),
  customCategory: yup.string().when("category", {
    is: "other",
    then: (s) =>
      s.required("Veuillez préciser la catégorie").min(3, "Trop court"),
    otherwise: (s) => s.notRequired(),
  }),
  startDate: yup.date().nullable().notRequired(),
  endDate: yup
    .date()
    .nullable()
    .notRequired()
    .when("startDate", (startDate, schema) =>
      startDate
        ? schema.min(
            startDate,
            "La date de fin doit être après la date de début",
          )
        : schema,
    ),
  maxLearners: yup
    .number()
    .typeError("Doit être un nombre")
    .min(1, "Minimum 1 apprenant")
    .required("Capacité requise"),
  price: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Prix invalide")
    .required("Prix requis"),
});

// ─────────────────────────────────────────
// Schéma mise à jour
// ✅ status retiré — même raison
// ─────────────────────────────────────────
export const trainingUpdateSchema = yup.object().shape({
  title: yup.string().min(3, "Titre trop court").required("Titre requis"),
  description: yup.string().notRequired(),
  category: yup.string().required("Catégorie requise"),
  customCategory: yup.string().when("category", {
    is: "other",
    then: (s) =>
      s.required("Veuillez préciser la catégorie").min(3, "Trop court"),
    otherwise: (s) => s.notRequired(),
  }),
  startDate: yup.date().nullable().notRequired(),
  endDate: yup
    .date()
    .nullable()
    .notRequired()
    .when("startDate", (startDate, schema) =>
      startDate
        ? schema.min(
            startDate,
            "La date de fin doit être après la date de début",
          )
        : schema,
    ),
  maxLearners: yup
    .number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .integer("Doit être entier")
    .required("Capacité requise"),
  price: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Prix invalide")
    .required("Prix requis"),
});
