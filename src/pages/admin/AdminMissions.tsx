import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function AdminMissions() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manajemen Misi</h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Fitur manajemen misi akan segera hadir.</p>
      </motion.div>
    </div>
  );
}
