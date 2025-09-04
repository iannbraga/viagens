const { createApp, ref, reactive } = Vue;

createApp({
    setup() {
        // --- Estado ---
        let pessoas = reactive([
            { id: 1, nome: "João", espaco: 1 },
            { id: 2, nome: "Pedro", espaco: 1 },
            { id: 3, nome: "Thiago", espaco: 1 },
            { id: 4, nome: "Lucas", espaco: 1 },
            { id: 5, nome: "Pedro e Thiago", espaco: 2 },
            { id: 6, nome: "Joana e Thiago", espaco: 2 },
            { id: 7, nome: "Luca e Thiago", espaco: 2 },
            { id: 8, nome: "Mateus e Thiago", espaco: 2 },
            { id: 9, nome: "Pietro e Thiago", espaco: 2 },
            { id: 10, nome: "Caio e Thiago", espaco: 2 },
            { id: 11, nome: "Karin e Thiago", espaco: 2 },
            { id: 12, nome: "Antonio e Thiago", espaco: 2 },
        ]);

        let carros = reactive([
            { id: 1, nome: "Carro 1", capacidade: 3, motorista: null },
            { id: 2, nome: "Carro 2", capacidade: 3, motorista: null },
            { id: 3, nome: "Carro 3", capacidade: 3, motorista: null },
            { id: 4, nome: "Carro 4", capacidade: 3, motorista: null },
            { id: 5, nome: "Van 1", capacidade: 10, motorista: null },
            { id: 6, nome: "Van 2", capacidade: 16, motorista: null },
        ]);

        let viagens = reactive([
            { id: 1, descricao: "Primeira viagem", carroId: 1, data: "2025-09-04", pessoas: [1, 2] },
            { id: 2, descricao: "Segunda viagem", carroId: 2, data: "2025-09-05", pessoas: [3, 4, 5] }
        ]);

        // --- Inputs reativos ---
        let novaPessoaNome = ref("");
        let novaPessoaEspaco = ref(1);

        let novoCarroNome = ref("");
        let novoCarroCapacidade = ref(1);

        let novaViagemDescricao = ref("");
        let novaViagemData = ref("");
        let novaViagemCarro = ref(-1);
        let novaViagemPessoas = ref([]);

        // Busca de pessoas por viagem
        let buscaPessoaPorViagem = reactive({});

        // --- CRUD Pessoas ---
        const adicionarPessoa = () => {
            if (!novaPessoaNome.value) return;
            pessoas.push({ id: Date.now(), nome: novaPessoaNome.value, espaco: novaPessoaEspaco.value || 1 });
            novaPessoaNome.value = "";
            novaPessoaEspaco.value = 1;
            salvarDados();
        };

        const editarPessoa = (id, novoNome, novoEspaco) => {
            let p = pessoas.find(p => p.id === id);
            if (p) {
                p.nome = novoNome;
                p.espaco = novoEspaco;
                salvarDados();
            }
        };

        const removerPessoa = (id) => {
            let index = pessoas.findIndex(p => p.id === id);
            if (index !== -1) pessoas.splice(index, 1);
            // também remove das viagens
            viagens.forEach(v => v.pessoas = v.pessoas.filter(pid => pid !== id));
            salvarDados();
        };

        // --- CRUD Carros ---
        const adicionarCarro = () => {
            if (!novoCarroNome.value) return;
            carros.push({ id: Date.now(), nome: novoCarroNome.value, capacidade: novoCarroCapacidade.value || 1, motorista: null });
            novoCarroNome.value = "";
            novoCarroCapacidade.value = 1;
            salvarDados();
        };

        const editarCarro = (id, novoNome, novaCapacidade) => {
            let c = carros.find(c => c.id === id);
            if (c) {
                c.nome = novoNome;
                c.capacidade = novaCapacidade;
                salvarDados();
            }
        };

        const removerCarro = (id) => {
            let index = carros.findIndex(c => c.id === id);
            if (index !== -1) carros.splice(index, 1);
            // também remove das viagens
            viagens.forEach(v => {
                if (v.carroId === id) v.carroId = null;
            });
            salvarDados();
        };

        // --- CRUD Viagens ---
        const adicionarViagem = () => {
            // Corrige a validação do carro
            if (!novaViagemDescricao.value || novaViagemCarro.value == null || novaViagemCarro.value === -1) return;

            viagens.push({
                id: Date.now(),
                descricao: novaViagemDescricao.value,
                carroId: novaViagemCarro.value,
                data: novaViagemData.value,
                pessoas: [] // Garante que toda viagem criada tenha o campo pessoas
            });

            novaViagemDescricao.value = "";
            novaViagemData.value = "";
            novaViagemCarro.value = -1;
            novaViagemPessoas.value = [];
            salvarDados();
        };

        const editarViagem = (id, novosDados) => {
            let v = viagens.find(v => v.id === id);
            if (v) {
                Object.assign(v, novosDados);
                salvarDados();
            }
        };

        const removerViagem = (id) => {
            let index = viagens.findIndex(v => v.id === id);
            if (index !== -1) viagens.splice(index, 1);
            salvarDados();
        };

        // --- Pessoas nas viagens ---
        const adicionarPessoaNaViagem = (viagemId, pessoaId) => {
            let v = viagens.find(v => v.id === viagemId);
            if (!v) return;
            if (!v.pessoas) v.pessoas = [];
            if (v.pessoas.includes(pessoaId)) return;

            // Verifica lotação
            const carro = carros.find(c => c.id === v.carroId);
            if (!carro) return;
            // Soma o espaço ocupado pelas pessoas já na viagem
            const totalEspaco = v.pessoas.reduce((soma, pid) => {
                const pessoa = pessoas.find(p => p.id === pid);
                return soma + (pessoa ? pessoa.espaco : 1);
            }, 0);
            // Espaço da nova pessoa
            const novaPessoa = pessoas.find(p => p.id === pessoaId);
            const espacoNovaPessoa = novaPessoa ? novaPessoa.espaco : 1;
            if (totalEspaco + espacoNovaPessoa > carro.capacidade) {
                alert('Capacidade máxima do veículo atingida!');
                return;
            }
            v.pessoas.push(pessoaId);
            salvarDados();
        };

        const removerPessoaDaViagem = (viagemId, pessoaId) => {
            let v = viagens.find(v => v.id === viagemId);
            if (v && v.pessoas) {
                v.pessoas = v.pessoas.filter(pid => pid !== pessoaId);
                salvarDados();
            }
        };

        // Pessoas filtradas para adicionar em cada viagem
        const pessoasFiltradasParaViagem = (viagemId) => {
            const termo = (buscaPessoaPorViagem[viagemId] || '').toLowerCase();
            return pessoas.filter(p =>
                p.nome.toLowerCase().includes(termo) &&
                !(viagens.find(v => v.id === viagemId)?.pessoas || []).includes(p.id)
            );
        };

        // --- Carros nas viagens ---
        const trocarCarroDaViagem = (viagemId, novoCarroId) => {
            let v = viagens.find(v => v.id === viagemId);
            if (v) {
                v.carroId = novoCarroId;
                salvarDados();
            }
        };

        // --- Persistência ---
        const salvarDados = () => {
            localStorage.setItem("pessoas", JSON.stringify(pessoas));
            localStorage.setItem("carros", JSON.stringify(carros));
            localStorage.setItem("viagens", JSON.stringify(viagens));
        };

        const carregarDados = () => {
            let p = JSON.parse(localStorage.getItem("pessoas"));
            let c = JSON.parse(localStorage.getItem("carros"));
            let v = JSON.parse(localStorage.getItem("viagens"));

            if (p) pessoas.splice(0, pessoas.length, ...p);
            if (c) carros.splice(0, carros.length, ...c);
            if (v) viagens.splice(0, viagens.length, ...v);
        };

        // --- Inicialização ---
        carregarDados();

        // --- Retorno ---
        return {
            pessoas, carros, viagens,
            // inputs
            novaPessoaNome, novaPessoaEspaco,
            novoCarroNome, novoCarroCapacidade,
            novaViagemDescricao, novaViagemData, novaViagemCarro, novaViagemPessoas,
            buscaPessoaPorViagem,
            // pessoas
            adicionarPessoa, editarPessoa, removerPessoa,
            // carros
            adicionarCarro, editarCarro, removerCarro,
            // viagens
            adicionarViagem, editarViagem, removerViagem,
            adicionarPessoaNaViagem, removerPessoaDaViagem,
            trocarCarroDaViagem,
            pessoasFiltradasParaViagem,
            // persistência
            salvarDados, carregarDados
        };
    }
}).mount("#app");
