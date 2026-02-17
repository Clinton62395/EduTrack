import { useAuth } from "@/components/constants/authContext";
import { Button } from "@/components/ui/theme";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { ConfirmModal } from "../modal/ConfirmModal";

export function LogoutButton({
  title = "Déconnexion",
  variant = "red",
  requireMasterCode = false,
  masterCode,
}) {
  const { logout } = useAuth();

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  return (
    <>
      <Button
        title={title}
        variant={variant}
        onPress={() => setVisible(true)}
        icon={<LogOut size={20} color="white" />}
      />

      <ConfirmModal
        visible={visible}
        onClose={() => !loading && setVisible(false)}
        onConfirm={handleConfirm}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        loading={loading}
        requiredMasterCode={requireMasterCode ? masterCode : undefined}
      />
    </>
  );
}
