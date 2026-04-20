import { useEffect, useState } from "react";
import Image from "next/image";

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
    const [modal, setModal] = useState({titulo: null, mensagem: null})

    
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
                    const coluna = novoBuffer[linha].findIndex(
                        item => !item.combinacao && !item.isActive
                    );
                    
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

    const LimparCombinacao = () => {
        setBuffer(prevBuffer => {
            const novoBuffer = [...prevBuffer];
            const linhaIndex = conjunto - 1;

            novoBuffer[linhaIndex] = novoBuffer[linhaIndex].map(item => 
                item.isActive ? item : { ...item, combinacao: null, icone: null }
            );

            return novoBuffer;
        });
    };

    if (!dados) return <p>Carregando...</p>;
    
    return (
        <>
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                    <div class="modal-header" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '10px 0px'
                    }}>
                        <h1 class="modal-title fs-5" id="staticBackdropLabel">
                            {modal.titulo}
                        </h1>
                        <p>{modal.mensagem}</p>
                    </div>
                    <div className="modal-body">
                        <p>
                            <strong>Combinação correta</strong>
                        </p>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            {combinacoes.map((item, index) => (
                                <div key={index} className="text-center">
                                    <Image
                                        src={item.imagem}
                                        priority
                                        width={64}
                                        height={64}
                                        alt={item.nome}
                                    />
                                    <p>
                                        {item.nome}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button 
                            type="button" 
                            class="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Jogar novamente
                        </button>
                    </div>
                    </div>
                </div>
            </div>
            <div className="main">
                <div className="display scroll">
                    {buffer.slice(0, conjunto).map((linha, i) => (
                        <div key={i} className="resultado">
                            {linha.map((item, j) => (
                                <div 
                                    key={j} 
                                    className={item.icone ? `border-${item.icone.split(' ').pop().split('-').pop()}` : ""}
                                    style={{ 
                                        "--colunas": `${100 / totalItensSuperior}%`,
                                        border: item.isActive ? '2px solid' : '2px dashed',
                                        opacity: item.isActive ? '0.5' : '1'
                                    }}
                                >
                                    {item.combinacao ? (
                                        <>
                                            <Image
                                                src={item.combinacao.resultado.imagem}
                                                priority
                                                width={64}
                                                height={64}
                                                alt={item.combinacao.resultado.nome}
                                            />
                                            <p>
                                                {item.combinacao.resultado.nome}
                                                <i className={item.icone}></i>
                                            </p>
                                        </>
                                    ) : (
                                        <p>Vazio</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="item">
                    <button 
                        type="button" 
                        class="btn btn-danger"
                        onClick={LimparCombinacao}
                    >Limpar</button>

                    {itensAleatorios.map((elemento, index) => (
                        <div 
                            key={index} 
                            className="blocoBase"
                            style={{
                                border: index === itemAtivoId ? '3px solid green' : 'none'
                            }}
                            onClick={() => selecionarItem(elemento.nome, index)}
                        >
                            <Image
                                src={elemento.imagem}
                                priority
                                width={64}
                                height={64}
                                alt={elemento.nome}
                            />
                            <p>{elemento.nome}</p>
                        </div>
                    ))}

                    <button 
                        type="button" 
                        class="btn btn-success"
                        onClick={verificarCombinacao}
                    >Verificar</button>
                </div>
                <div className="descricao">
                    {alert ? 
                        <div className="alert alert-warning show-alert" role="alert">
                            {alert}
                        </div>
                        :
                        <div></div>
                    }
                    <div className="tentativas">
                        <div>Tentativas</div>
                        <div>{contadorTentativas}</div>
                    </div>
                    <div className="icons">
                        <p><i className={feedback.correto}></i>Correto</p>
                        <p><i className={feedback.parcial}></i>Parcial</p>
                        <p><i className={feedback.trocar}></i>Trocar posição</p>
                        <p><i className={feedback.errado}></i>Errado</p>
                    </div>
                </div>
            </div>
        </>
    )
}