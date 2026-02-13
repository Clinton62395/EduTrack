import { db } from "@/components/lib/firebase";
import { useModules } from "@/hooks/useModule";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useTrainingDetail(id) {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la visibilité des Modals
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // On récupère les outils du hook useModules
  const moduleHook = useModules(id);

  // Écoute de la formation en temps réel
  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, "formations", id),
      (snapshot) => {
        if (snapshot.exists()) {
          setFormation({ id: snapshot.id, ...snapshot.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erreur detail:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  // Logique pour ouvrir le modal en mode "Ajout"
  const handleOpenAdd = () => {
    setSelectedModule(null);
    setModuleModalVisible(true);
  };

  // Logique pour ouvrir le modal en mode "Edition"
  const handleOpenEdit = (module) => {
    setSelectedModule(module);
    setModuleModalVisible(true);
  };

  const handleCloseModuleModal = () => {
    setModuleModalVisible(false);
    setSelectedModule(null);
  };

  // Centralisation de la sauvegarde (Ajout ou Update)
  const handleSubmitModule = async ({ id: moduleId, title }) => {
    try {
      if (moduleId) {
        await moduleHook.updateModule(moduleId, title);
      } else {
        await moduleHook.addModule(title);
      }
      handleCloseModuleModal();
    } catch (error) {
      console.error("Erreur submit module:", error);
    }
  };

  // ON REGROUPE TOUT POUR L'ÉCRAN
  return {
    formation,
    loading: loading || moduleHook.loading,
    modules: moduleHook.modules,

    // Objet pour le composant Snack
    snack: {
      visible: moduleHook.snackVisible,
      message: moduleHook.snackMessage,
      type: moduleHook.snackType,
      dismiss: moduleHook.dismissSnack,
    },

    // Objet pour piloter les Modals
    modals: {
      update: {
        visible: updateModalVisible,
        open: () => setUpdateModalVisible(true),
        close: () => setUpdateModalVisible(false),
      },
      module: {
        visible: moduleModalVisible,
        selected: selectedModule,
        close: handleCloseModuleModal,
      },
    },

    // Objet pour les actions sur les modules
    moduleActions: {
      handleOpenAdd, // <--- C'est cette fonction qui manquait !
      handleOpenEdit,
      handleDelete: moduleHook.deleteModule,
      handleSubmit: handleSubmitModule,
      isSubmitting: moduleHook.loading,
    },
  };
}
