/**
 * ÉCRAN DE MIGRATION — À utiliser une seule fois via DevMenu
 * Supprimez cet écran après la migration.
 */

import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ms } from "../../components/ui/theme";
import { migrateFormationStatuses } from "../../migration";

export default function DevMigrationScreen() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  const handleMigrate = async () => {
    setRunning(true);
    setResult(null);
    setLogs([]);

    // Intercepte les console.log du script
    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(" "));
    };
    console.error = (...args) => {
      originalError(...args);
      addLog("❌ " + args.join(" "));
    };

    try {
      const summary = await migrateFormationStatuses();
      setResult(summary);
    } catch (err) {
      addLog("💥 Erreur fatale: " + err.message);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setRunning(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>🛠 Migration Statuts</Text>
        <Text style={s.subtitle}>
          Aligne les formations existantes sur le nouveau système draft /
          published / archived
        </Text>
      </View>

      {/* Règles */}
      <View style={s.rules}>
        {[
          { from: '"planned"', to: '"draft"' },
          { from: '"ongoing"', to: '"published"' },
          { from: '"completed"', to: '"archived"' },
          { from: "undefined", to: '"draft"' },
        ].map((r, i) => (
          <Text key={i} style={s.rule}>
            {r.from} → {r.to}
          </Text>
        ))}
      </View>

      {/* Bouton */}
      <TouchableOpacity
        style={[s.btn, running && s.btnDisabled]}
        onPress={handleMigrate}
        disabled={running}
      >
        {running ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={s.btnText}>Lancer la migration</Text>
        )}
      </TouchableOpacity>

      {/* Résultat */}
      {result && (
        <View style={s.result}>
          <Text style={s.resultTitle}>✅ Migration terminée</Text>
          <Text style={s.resultLine}>Migrées : {result.migrated}</Text>
          <Text style={s.resultLine}>Ignorées : {result.skipped}</Text>
          <Text
            style={[s.resultLine, result.errors > 0 && { color: "#DC2626" }]}
          >
            Erreurs : {result.errors}
          </Text>
        </View>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <ScrollView style={s.logBox}>
          {logs.map((log, i) => (
            <Text key={i} style={s.logLine}>
              {log}
            </Text>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB", padding: ms(20) },
  header: { marginBottom: ms(20) },
  title: {
    fontSize: ms(22),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: ms(4),
  },
  subtitle: { fontSize: ms(14), color: "#64748B", lineHeight: ms(20) },
  rules: {
    backgroundColor: "#EFF6FF",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: ms(20),
    gap: ms(6),
  },
  rule: { fontSize: ms(13), color: "#1E40AF", fontFamily: "monospace" },
  btn: {
    backgroundColor: "#2563EB",
    padding: ms(16),
    borderRadius: ms(12),
    alignItems: "center",
    marginBottom: ms(20),
  },
  btnDisabled: { backgroundColor: "#93C5FD" },
  btnText: { color: "white", fontWeight: "700", fontSize: ms(16) },
  result: {
    backgroundColor: "#F0FDF4",
    borderRadius: ms(12),
    padding: ms(16),
    marginBottom: ms(16),
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  resultTitle: {
    fontWeight: "700",
    color: "#15803D",
    marginBottom: ms(8),
    fontSize: ms(15),
  },
  resultLine: { fontSize: ms(14), color: "#166534", marginBottom: ms(2) },
  logBox: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: ms(12),
    padding: ms(12),
  },
  logLine: {
    fontSize: ms(11),
    color: "#94A3B8",
    fontFamily: "monospace",
    marginBottom: ms(2),
  },
});
