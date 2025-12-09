// ===== CONFIGURAÇÃO INICIAL DO ADMIN =====
let adminConfig = JSON.parse(localStorage.getItem('adminConfig'));

if (!adminConfig || !adminConfig.login || !adminConfig.senha) {
  adminConfig = { login: 'admin', senha: '1234' };
  localStorage.setItem('adminConfig', JSON.stringify(adminConfig));
}

// ===== SISTEMA DE USUÁRIOS LOCAL =====
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// ELEMENTOS GERAIS
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const adminLoginLabel = document.getElementById('adminLoginLabel');

// LOGIN ADMIN
const formLoginAdmin = document.getElementById('formLoginAdmin');
const adminLoginInput = document.getElementById('adminLoginInput');
const adminSenhaInput = document.getElementById('adminSenhaInput');

// FORM USUÁRIO
const formUsuario = document.getElementById('formUsuario');
const listaUsuarios = document.getElementById('listaUsuarios');

// MODAL EDITAR
const modal = document.getElementById('modalEditar');
const formEditar = document.getElementById('formEditar');
const cancelarEdicao = document.getElementById('cancelarEdicao');

// FORM ALTERAR SENHA ADMIN
const formAlterarSenhaAdmin = document.getElementById('formAlterarSenhaAdmin');
const novaSenhaAdminInput = document.getElementById('novaSenhaAdmin');

// Atualiza label com login atual do admin
adminLoginLabel.textContent = adminConfig.login || 'admin';

// ===== FUNÇÃO: SALVAR LOCAL =====
function salvarLocal() {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// ===== GERADOR DE SENHA ALEATÓRIA =====
function gerarSenha(tamanho = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// ===== FUNÇÃO PARA GERAR LOGIN =====
// Formato: nomedousuario.evento (sem espaços, minúsculo)
function gerarLogin(nome, evento) {
  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .replace(/\s+/g, ''); // remove espaços

  const nomeNorm = normalizar(nome);
  const eventoNorm = normalizar(evento);
  return `${nomeNorm}.${eventoNorm}`;
}

// ===== LOGIN DO ADMIN (COM ANIMAÇÃO) =====
formLoginAdmin.addEventListener('submit', (e) => {
  e.preventDefault();

  const loginDigitado = adminLoginInput.value.trim();
  const senhaDigitada = adminSenhaInput.value.trim();

  if (loginDigitado === adminConfig.login && senhaDigitada === adminConfig.senha) {
    // Sucesso - aplica fade-out na tela de login
    loginSection.classList.add('fade-out');

    // Depois de 600ms, exibe o painel com fade-in
    setTimeout(() => {
      loginSection.style.display = 'none';
      appSection.classList.remove('hidden');
      appSection.classList.add('fade-in');
    }, 600);
  } else {
    alert('Login ou senha do admin inválidos.');
  }
});

// ===== SALVAR NOVO USUÁRIO =====
formUsuario.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nomeUsuario').value.trim();
  const evento = document.getElementById('eventoUsuario').value.trim();

  if (!nome || !evento) {
    alert('Preencha nome e evento.');
    return;
  }

  const loginGerado = gerarLogin(nome, evento);
  const senhaGerada = gerarSenha(6);

  const usuario = {
    id: Date.now(),
    nome,
    evento,
    login: loginGerado,
    senha: senhaGerada
  };

  usuarios.push(usuario);
  salvarLocal();
  formUsuario.reset();
  renderUsuarios();
  alert(`✅ Usuário salvo!\nLogin: ${loginGerado}\nSenha: ${senhaGerada}`);
});

// ===== RENDERIZAR USUÁRIOS =====
function renderUsuarios() {
  listaUsuarios.innerHTML = '';

  if (usuarios.length === 0) {
    listaUsuarios.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
    return;
  }

  usuarios.forEach((u) => {
    const div = document.createElement('div');
    div.classList.add('usuario-card');
    div.innerHTML = `
      <h3>${u.nome}</h3>
      <p><b>Evento:</b> ${u.evento}</p>
      <p><b>Login:</b> ${u.login}</p>
      <div class="senha-linha">
        <span><b>Senha:</b> <span class="senha-valor">${u.senha}</span></span>
        <button class="btn-icon" onclick="copiarSenha(${u.id})" title="Copiar senha">📋</button>
      </div>
      <div class="acoes-usuario">
        <button onclick="editarUsuario(${u.id})">Editar</button>
        <button onclick="excluirUsuario(${u.id})">Excluir</button>
      </div>
    `;
    listaUsuarios.appendChild(div);
  });
}

renderUsuarios();

// ===== COPIAR SENHA =====
function copiarSenha(id) {
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return;
  const senha = usuario.senha;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(senha)
      .then(() => alert('🔑 Senha copiada para a área de transferência!'))
      .catch(() => alert('Não foi possível copiar automaticamente. Senha: ' + senha));
  } else {
    const temp = document.createElement('textarea');
    temp.value = senha;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    alert('🔑 Senha copiada para a área de transferência!');
  }
}
window.copiarSenha = copiarSenha;

// ===== EXCLUIR USUÁRIO =====
function excluirUsuario(id) {
  const idNum = Number(id);
  if (!confirm('Deseja realmente excluir este usuário?')) return;
  usuarios = usuarios.filter((u) => Number(u.id) !== idNum);
  salvarLocal();
  renderUsuarios();
}
window.excluirUsuario = excluirUsuario;

// ===== EDITAR USUÁRIO =====
function editarUsuario(id) {
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return;

  document.getElementById('editId').value = usuario.id;
  document.getElementById('editNome').value = usuario.nome;
  document.getElementById('editEvento').value = usuario.evento;

  modal.style.display = 'flex';
}
window.editarUsuario = editarUsuario;

cancelarEdicao.addEventListener('click', () => {
  modal.style.display = 'none';
});

formEditar.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('editId').value);
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return;

  const novoNome = document.getElementById('editNome').value.trim();
  const novoEvento = document.getElementById('editEvento').value.trim();

  if (!novoNome || !novoEvento) {
    alert('Preencha nome e evento.');
    return;
  }

  usuario.nome = novoNome;
  usuario.evento = novoEvento;
  usuario.login = gerarLogin(novoNome, novoEvento);

  salvarLocal();
  renderUsuarios();
  modal.style.display = 'none';
  alert('Usuário atualizado com sucesso!');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// ===== BACKUP E RESTAURAÇÃO =====
document.getElementById('btnExportar').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(usuarios, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'backup-usuarios.json';
  link.click();
});

document.getElementById('btnImportar').addEventListener('click', () => {
  const file = document.getElementById('importarBackup').files[0];
  if (!file) return alert('Selecione um arquivo JSON válido.');
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      if (!Array.isArray(dados)) throw new Error();
      usuarios = dados;
      salvarLocal();
      renderUsuarios();
      alert('✅ Backup importado com sucesso!');
    } catch {
      alert('❌ Erro ao importar arquivo. Certifique-se de que é um JSON válido.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('btnLimpar').addEventListener('click', () => {
  if (confirm('Tem certeza que deseja apagar todos os usuários salvos localmente?')) {
    localStorage.removeItem('usuarios');
    usuarios = [];
    renderUsuarios();
  }
});

// ===== RESETAR SISTEMA COM ANIMAÇÃO =====
document.getElementById('btnResetar').addEventListener('click', () => {
  if (
    confirm('⚠️ Deseja realmente RESETAR TODO o sistema? Todos os dados e configurações serão apagados.')
  ) {
    appSection.classList.add('fade-out');
    setTimeout(() => {
      localStorage.clear();
      usuarios = [];
      alert('✅ Sistema resetado! Recarregando...');
      window.location.reload();
    }, 800);
  }
});

// ===== ALTERAR SENHA DO ADMIN =====
formAlterarSenhaAdmin.addEventListener('submit', (e) => {
  e.preventDefault();
  const novaSenha = novaSenhaAdminInput.value.trim();
  if (!novaSenha) {
    alert('Digite uma nova senha para o admin.');
    return;
  }
  adminConfig.senha = novaSenha;
  localStorage.setItem('adminConfig', JSON.stringify(adminConfig));
  novaSenhaAdminInput.value = '';
  alert('✅ Senha do admin atualizada com sucesso!');
});
