import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Isi semua field yang wajib');
      return;
    }
    setSending(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_vbwh3ip',
        import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID || 'template_k6066f7',
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          to_email: 'fahrixzstore@gmail.com',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'g8pXvoSYyGzCMg0vo'
      );
      toast.success('Pesan terkirim! Kami akan membalas segera.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-4 text-center">Hubungi Kami</h1>
        <p className="text-muted-foreground text-center mb-8">Ada pertanyaan? Kami siap membantu Anda.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Mail, label: 'Email', value: 'fahriandriansaputraa@gmail.com' },
            { icon: Phone, label: 'Telepon', value: '085609949819' },
            { icon: MapPin, label: 'Alamat', value: 'Kab. Tanggamus, Lampung' },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
              <item.icon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Kirim Pesan
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subjek</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Pesan *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 px-6 rounded-xl transition-colors">
              <Send className="w-4 h-4" />
              {sending ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
