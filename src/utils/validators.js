// Regex de validacion compartido por los formularios (auth + admin) para que las reglas
// de email y telefono no se dupliquen entre pantallas.

// Email: usuario + @ + dominio + . + TLD, sin espacios.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Telefono: 8 a 15 digitos, con prefijo internacional "+" opcional.
export const PHONE_REGEX = /^\+?\d{8,15}$/;

// Misma regla, como string para el atributo HTML `pattern` de los <input>
// (el navegador ancla el patron de forma implicita, sin "^" ni "$").
export const EMAIL_PATTERN = "[^\\s@]+@[^\\s@]+\\.[^\\s@]+";
export const PHONE_PATTERN = "\\+?\\d{8,15}";

export function emailError(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "El email es obligatorio";
  return EMAIL_REGEX.test(trimmed) ? "" : "Ingresa un email valido (ej: nombre@dominio.com)";
}

export function phoneError(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "El telefono es obligatorio";
  return PHONE_REGEX.test(trimmed) ? "" : "Ingresa un telefono valido (8 a 15 digitos)";
}

// --- Tarjeta de credito (checkout) ---
export const CARD_NUMBER_REGEX = /^\d{16}$/; // 16 digitos, sin espacios
export const EXPIRY_REGEX = /^\d{2}\/\d{2}$/; // MM/AA
export const CVV_REGEX = /^\d{3,4}$/; // 3 o 4 digitos

// Algoritmo de Luhn: el backend (pasarela ficticia) rechaza tarjetas que no lo cumplen,
// asi que lo validamos tambien en el front para avisar al instante.
export function luhnValid(numero) {
  let suma = 0;
  let duplicar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = numero.charCodeAt(i) - 48;
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}

// Validacion por campo de la tarjeta. Devuelve el mensaje de error o "" si es valido.
// Con `allowEmpty` (validacion en vivo) un campo vacio no es error todavia.
export function cardFieldError(field, value, { allowEmpty = false } = {}) {
  const v = (value || "").trim();
  if (v === "") return allowEmpty ? "" : "Campo obligatorio";
  if (field === "numeroTarjeta") {
    const digits = v.replace(/\s/g, "");
    if (!CARD_NUMBER_REGEX.test(digits)) return "El numero debe tener 16 digitos";
    if (!luhnValid(digits)) return "Numero de tarjeta invalido";
    return "";
  }
  if (field === "vencimiento") return EXPIRY_REGEX.test(v) ? "" : "Formato MM/AA";
  if (field === "cvv") return CVV_REGEX.test(v) ? "" : "El CVV debe tener 3 o 4 digitos";
  return ""; // titularTarjeta: sin validacion de formato
}
