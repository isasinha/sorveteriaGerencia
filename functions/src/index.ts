import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp();

// Exclui um usuário do Firebase Auth pelo UID ou e-mail
export const excluirUsuarioAuth = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Não autorizado.');
  }

  const { uid, email } = request.data as { uid?: string; email?: string };
  let resolvedUid = uid;

  if (!resolvedUid && email) {
    try {
      const user = await getAuth().getUserByEmail(email);
      resolvedUid = user.uid;
    } catch {
      return { success: true }; // Usuário não existe no Auth
    }
  }

  if (!resolvedUid) {
    throw new HttpsError('invalid-argument', 'UID ou e-mail são obrigatórios.');
  }

  await getAuth().deleteUser(resolvedUid);
  return { success: true };
});

// Atualiza o e-mail de um usuário no Firebase Auth pelo UID ou e-mail antigo
export const atualizarEmailAuth = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Não autorizado.');
  }

  const { uid, emailAntigo, emailNovo } = request.data as {
    uid?: string;
    emailAntigo?: string;
    emailNovo: string;
  };

  if (!emailNovo) {
    throw new HttpsError('invalid-argument', 'emailNovo é obrigatório.');
  }

  let resolvedUid = uid;

  if (!resolvedUid && emailAntigo) {
    try {
      const user = await getAuth().getUserByEmail(emailAntigo);
      resolvedUid = user.uid;
    } catch {
      return { success: true }; // Usuário não existe no Auth
    }
  }

  if (!resolvedUid) {
    throw new HttpsError('invalid-argument', 'UID ou emailAntigo são obrigatórios.');
  }

  await getAuth().updateUser(resolvedUid, { email: emailNovo });
  return { success: true };
});
