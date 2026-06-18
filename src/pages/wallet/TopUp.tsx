import { motion } from 'framer-motion';
import { ArrowUpCircle } from 'lucide-react';

export default function TopUp() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
          <ArrowUpCircle className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold mb-2">Top Up</h1>
          <p className="text-muted-foreground">Fitur top up akan segera hadir.</p>
        </div>
      </motion.div>
    </div>
  );
}
