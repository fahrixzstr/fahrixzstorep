import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function Missions() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
          <Target className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Misi</h1>
          <p className="text-muted-foreground">Fitur misi akan segera hadir.</p>
        </div>
      </motion.div>
    </div>
  );
}
