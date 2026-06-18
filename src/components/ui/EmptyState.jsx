import { Text } from "./Text.jsx";

// Centered "nothing here yet" block. Optional `icon`/`title`, a `message`, and an
// `action` slot (typically a <Button>). Wrap in a <Card> at the call site when a
// bordered surface is needed.
export const EmptyState = ({ icon, title, message, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`.trim()}>
    {icon}
    {title && <Text variant="section">{title}</Text>}
    {message && <Text variant="subtitle">{message}</Text>}
    {action}
  </div>
);
