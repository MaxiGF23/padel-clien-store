import { X } from "lucide-react";
import { Button } from "@/components/Button.jsx";
import { Card } from "@/components/ui/Card.jsx";
import { Text } from "@/components/ui/Text.jsx";
import { FormField } from "@/components/ui/FormField.jsx";

// Admin UI now builds on the shared atoms. These exports keep the admin call sites
// (AdminButton/Field/StatusBadge) stable while removing the duplicated styling.
export { StatusBadge } from "@/components/ui/StatusBadge.jsx";

// Admin buttons are the compact (sm) variant of the shared Button and never submit by
// default (they live in tables outside of forms).
export const AdminButton = ({ type = "button", ...props }) => <Button size="sm" type={type} {...props} />;

// Field is the shared FormField under its historical admin name.
export const Field = FormField;

export const AdminTable = ({ title, children }) => (
  <Card as="section" className="overflow-hidden">
    <div className="border-b border-line px-4 py-3 text-xs font-extrabold">{title}</div>
    <div className="overflow-x-auto">{children}</div>
  </Card>
);

export const AdminModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
    <Card className="w-full max-w-xl shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <Text variant="section">{title}</Text>
        <button type="button" onClick={onClose} className="focus-ring rounded p-1 hover:bg-paper" aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  </div>
);
