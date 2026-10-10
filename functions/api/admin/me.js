import { json } from '../../../lib/http.js';
export const onRequestGet = ({ data }) => json({ email: data.user.email });
