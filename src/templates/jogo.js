import { useEffect, useState } from "react";

import BlocoSuperior from "@/components/blocoSuperior";
import BlocoBase from "@/components/blocoBase";
import Descricao from "@/components/descricao";
import Modal from "@/components/modal";

export default function Jogo() {
    const totalItensSuperior = 4;
    const totalItensBase = 5;
    const tentativas = 5;

    const feedback = {
        correto: "bi bi-check2 text-success",
        parcial: "bi bi-check2-circle text-warning",
        trocar: "bi bi-arrow-repeat text-info",
        errado: "bi bi-ban text-danger"
    }

    const [dados, setDados] = useState(null);
    const [buffer, setBuffer] = useState([]);
    const [combinacoes, setCombinacoes] = useState([]);
    const [itensAleatorios, setItensAleatorios] = useState([]);
    const [itemSelecionado, setItemSelecionado] = useState([]);
    const [conjunto, setConjunto] = useState(1);
    const [contadorTentativas, setContadorTentativas] = useState(tentativas);
    const [itemAtivoId, setItemAtivoId] = useState(null);
    const [alert, setAlert] = useState(null);
    const [modal, setModal] = useState({titulo: null, mensagem: null});
    const [selecaoSuperior, setSelecaoSuperior] = useState({estado: false, coluna: null});

    
    useEffect(() => {
        fetch('/dados.json')
            .then(res => res.json())
            .then(data => {
                setDados(data);
        });

        const bufferInicial = Array.from({ length: tentativas }, () =>
            Array.from({ length: totalItensSuperior }, () => ({
                isActive: false,
                combinacao: null,
                icone: null
            }))
        );

        setBuffer(bufferInicial);

    }, []);

    useEffect(() => {
        if (dados) {
            const aleatorios = [...dados.elementos]
                .sort(() => Math.random() - 0.5)
                .slice(0, totalItensBase);

            setItensAleatorios(aleatorios);
            setCombinacoes(gerarResultados(aleatorios, dados));
        }
    }, [dados]);

   useEffect(() => {
        if (!alert) return;

        let start;
        let requestId;
        const duration = 2000;

        const tick = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;

            if (elapsed < duration) {
                requestId = requestAnimationFrame(tick);
            } else {
                setAlert(null);
            }
        };

        requestId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(requestId);
    }, [alert]);

    useEffect(() => {
        setSelecaoSuperior({
            estado: false, 
            coluna: null
        });
    }, [conjunto]);

    const gerarResultados = (itensAleatorios, dados) => {
        const resultados = [];

        // gera todas as combinações de pares
        for (let i = 0; i < itensAleatorios.length; i++) {
            for (let j = i + 1; j < itensAleatorios.length; j++) {

                const a = itensAleatorios[i].nome;
                const b = itensAleatorios[j].nome;

                // procura no JSON (ordem não importa)
                const combinacao = dados.combinacoes.find(c =>
                    c.ingredientes.includes(a) &&
                    c.ingredientes.includes(b)
                );

                if (combinacao) {
                    resultados.push(combinacao.resultado);
                }
            }
        }

        return resultados.sort(() => Math.random() - 0.5).slice(0, totalItensSuperior);
    };

    const selecionarItem = (item, id) => {
        setItemAtivoId(prevId => prevId === id ? null : id);

        setItemSelecionado(prev => {
            const novo = [...prev, item];

            if (novo[0] === novo[1]){
                setItemAtivoId(null);
                return [];
            }

            if (novo.length === 2) {

                const resultado = dados.combinacoes.find(c =>
                    c.ingredientes.every(i =>
                        novo.includes(i)
                    )
                );

                setBuffer(prevBuffer => {
                    const novoBuffer = [...prevBuffer];

                    const linha = conjunto - 1;
                    const coluna = selecaoSuperior.estado ? 
                        selecaoSuperior.coluna
                    : 
                        novoBuffer[linha].findIndex(
                            item => !item.combinacao && !item.isActive
                        )
                    
                    novoBuffer[linha][coluna] = {
                        ...novoBuffer[linha][coluna],
                        combinacao: resultado,
                        icone: null
                    };

                    return novoBuffer;
                });

                setItemAtivoId(null);

                return [];
            }

            return novo;
        });

    };

    const verificarCombinacao = () => {
        let contador = 0;
        const linhaIndex = conjunto - 1;
        const linha = buffer[linhaIndex];
        const usados = [];
        const icones = [];
        const inativos = [];

        const buscarIngredientes = (nomeBusca) => {
            return dados.combinacoes.find(c => c.resultado.nome === nomeBusca).ingredientes;
        }

        // Verifica se todos os espaços estão preenchidos
        if (!linha.every(item => item.combinacao !== null)) {
            setAlert("Preencha os espaços vazios");
            return;
        }

        // Pega os nomes do display (estando preenchidos)
        const nomes = linha.map(item => item.combinacao.resultado?.nome);

        // Combinação correta
        if (nomes.every((nome, i) => combinacoes[i]?.nome === nome)) {
            setBuffer(prev => {
                const novo = [...prev];

                novo[linhaIndex] = novo[linhaIndex].map(item => ({
                    ...item,
                    icone: feedback.correto
                }));

                return novo;
            });

            setModal({
                titulo: "PARABÉNS! VOCÊ GANHOU!",
                mensagem: "Você acertou a combinação"
            });

            const modalElement = document.getElementById('staticBackdrop');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();

            return;
        }

        // Tentativas esgotadas
        if (contadorTentativas-1 === 0){
            setContadorTentativas(0);
            
            setModal({
                titulo: "FIM DE JOGO! VOCÊ PERDEU!",
                mensagem: "Tentativas esgotadas"
            });

            const modalElement = document.getElementById('staticBackdrop');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();

            return;
        }

        // Posição correta
        nomes.forEach((nome, i) => {
            if (combinacoes[i]?.nome === nome) {
                inativos.push(i);
                icones[i] = feedback.correto;
                usados[i] = true;
                contador += 1;
            }
        });

        // Restante
        nomes.forEach((nome, i) => {

            if (icones[i]) return;

            const idx = combinacoes.findIndex((c, j) =>
                c.nome === nome && !usados[j]
            );
           
            if (idx !== -1) {
                icones[i] = feedback.trocar;
                usados[idx] = true;
            } else if (
                buscarIngredientes(nome).some(ing => buscarIngredientes(combinacoes[contador].nome).includes(ing))
            ) {
                icones[i] = feedback.parcial;
            } else {
                icones[i] = feedback.errado;
            }

            contador += 1;
        });

        contador = 0;

        setBuffer(prev => {
            const novo = [...prev];

            novo[linhaIndex] = novo[linhaIndex].map((item, i) => ({
                ...item,
                icone: icones[i]
            }));

            // Adicionar blocos inativos
            inativos.forEach(indexColuna => {
                novo[linhaIndex + 1][indexColuna] = {
                    isActive: true,
                    combinacao: novo[linhaIndex][indexColuna].combinacao,
                    icone: feedback.correto
                }

                novo[linhaIndex][indexColuna] = {
                    isActive: true,
                    combinacao: novo[linhaIndex][indexColuna].combinacao,
                    icone: feedback.correto
                }
            })
            
            return novo;
        });

        setConjunto(prev => prev + 1);
        setContadorTentativas(prev => prev - 1);

        // Faz o scrool descer até o limite automáticamente
        const container = document.querySelector('.display');

        requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight * 2,
                behavior: 'smooth'
            });
        });
    };

    const limparCombinacao = () => {
        setBuffer(prevBuffer => {
            const novoBuffer = [...prevBuffer];
            const linhaIndex = conjunto - 1;

            novoBuffer[linhaIndex] = novoBuffer[linhaIndex].map(item => 
                item.isActive ? item : { ...item, combinacao: null, icone: null }
            );

            return novoBuffer;
        });
    };

    const limparCombinacaoEspecifica = (coluna) => {
        setBuffer(prevBuffer => {
            const novoBuffer = [...prevBuffer];
            const linhaIndex = conjunto - 1;

            novoBuffer[linhaIndex][coluna] = {
                isActive: false,
                combinacao: null,
                icone: null
            }

            return novoBuffer;
        });
    };

    if (!dados) return <p>Carregando...</p>;
    
    return (
        <>
            <Modal
                modal={modal}
                combinacoes={combinacoes}
            />
            <div className="main">
                <BlocoSuperior
                    buffer={buffer}
                    conjunto={conjunto}
                    totalItensSuperior={totalItensSuperior}
                    selecaoSuperior={selecaoSuperior}
                    setSelecaoSuperior={setSelecaoSuperior}
                    limparCombinacaoEspecifica={limparCombinacaoEspecifica}
                />
                <BlocoBase
                    itemAtivoId={itemAtivoId}
                    itensAleatorios={itensAleatorios}
                    limparCombinacao={limparCombinacao}
                    verificarCombinacao={verificarCombinacao}
                    selecionarItem={selecionarItem}
                />
                <Descricao
                    alert={alert}
                    feedback={feedback}
                    contadorTentativas={contadorTentativas}
                />
            </div>
        </>
    )
}