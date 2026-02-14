import * as yup from "yup";

// Schéma Yup pour validation des formations
export const trainingCreateSchema = yup.object().shape({
  title: yup.string().min(5).required(),
  description: yup.string().required(),
  category: yup.string().required(),
  status: yup.string().required(),
  startDate: yup.date().required(),
  endDate: yup.date().min(yup.ref("startDate"), "Fin après début").required(),
  maxLearners: yup.number().min(1).required(),
  price: yup.number().required(),
});

// Schéma Yup pour validation des formations
export const trainingUpdateSchema = yup.object({
  title: yup.string().required("Titre requis").min(3, "Titre trop court"),
  description: yup.string(),

  category: yup.string().required("Catégorie requise"),
  customCategory: yup.string().when("category", {
    is: "other",
    then: (schema) =>
      schema.required("Veuillez préciser la catégorie").min(3, "Trop court"),
    otherwise: (schema) => schema.notRequired(),
  }),
  maxLearners: yup
    .number()
    .typeError("Doit être un nombre")
    .positive("Doit être positif")
    .integer("Doit être entier")
    .required("Nombre max requis"),
  price: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Prix invalide")
    .required("Prix requis"),
  startDate: yup.string().when("status", {
    is: "planned",
    then: (s) => s.required("Date de début requise"),
    otherwise: (s) => s.notRequired(),
  }),

  endDate: yup.string().when("status", {
    is: "planned",
    then: (s) => s.required("Date de fin requise"),
    otherwise: (s) => s.notRequired(),
  }),
});
