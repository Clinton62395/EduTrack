import { db } from "@/components/lib/firebase"; // Instance firestore() native
import { useModules } from "@/hooks/useModule"; // Assure-toi que useModules est aussi en natif
import { useEffect, useState } from "react";

/**
 * Hook central pour l'écran de détail d'une formation (Trainer/Learner).
 * Orchestre les données de la formation et les actions sur les modules.
 */
export function useTrainingDetail(id) {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la visibilité des Modals
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // On récupère les outils du hook useModules (Gestion des sous-collections)
  const moduleHook = useModules(id);

  // 📡 Écoute de la formation en temps réel (Native)
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsubscribe = db
      .collection("formations")
      .doc(id)
      .onSnapshot(
        (snapshot) => {
          // ✅ .exists est une propriété en React Native Firebase
          if (snapshot && snapshot.exists) {
            setFormation({ id: snapshot.id, ...snapshot.data() });
          } else {
            setFormation(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Erreur detail formation native:", error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [id]);

  // ── Gestion des Modals ──
  const handleOpenAdd = () => {
    setSelectedModule(null);
    setModuleModalVisible(true);
  };

  const handleOpenEdit = (module) => {
    setSelectedModule(module);
    setModuleModalVisible(true);
  };

  const handleCloseModuleModal = () => {
    setModuleModalVisible(false);
    setSelectedModule(null);
  };

  // 💾 Centralisation de la sauvegarde (via moduleHook)
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

  // 📦 Exportation des données et actions pour l'UI
  return {
    formation,
    modules: moduleHook.modules,
    loading: loading || moduleHook.loading,
    actionLoading: moduleHook.actionLoading,

    // Snack feedback (provenant de useModules)
    snack: {
      visible: moduleHook.snackVisible,
      message: moduleHook.snackMessage,
      type: moduleHook.snackType,
      dismiss: moduleHook.dismissSnack,
      show: moduleHook.showSnack,
    },

    // Contrôle des Modals
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

    // Actions sur les modules
    moduleActions: {
      handleOpenAdd,
      handleOpenEdit,
      handleDelete: moduleHook.deleteModule,
      handleSubmit: handleSubmitModule,
      isSubmitting: moduleHook.actionLoading,
    },
  };
}
