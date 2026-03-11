import { db } from "@/components/lib/firebase";
import { useModules } from "@/hooks/useModule";
import { doc, onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useTrainingDetail(id) {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const moduleHook = useModules(id);

  // ─────────────────────────────────────────
  // 📡 Formation en temps réel
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "formations", id),
      (snapshot) => {
        setFormation(
          snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
        );
        setLoading(false);
      },
      (error) => {
        console.error("Erreur detail formation:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [id]);

  // ─────────────────────────────────────────
  // 🪟 Modals
  // ─────────────────────────────────────────
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

  // ─────────────────────────────────────────
  // 💾 Submit module
  // ─────────────────────────────────────────
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

  return {
    formation,
    modules: moduleHook.modules,
    loading: loading || moduleHook.loading,
    actionLoading: moduleHook.actionLoading,
    snack: {
      visible: moduleHook.snackVisible,
      message: moduleHook.snackMessage,
      type: moduleHook.snackType,
      dismiss: moduleHook.dismissSnack,
      show: moduleHook.showSnack,
    },
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
    moduleActions: {
      handleOpenAdd,
      handleOpenEdit,
      handleDelete: moduleHook.deleteModule,
      handleSubmit: handleSubmitModule,
      isSubmitting: moduleHook.actionLoading,
    },
  };
}
