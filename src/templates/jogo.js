import { useEffect, useState } from "react";
import Image from "next/image";

export default function Jogo() {
    const totalItensSuperior = 5;
    const totalItensBase = 4;
    const tentativas = 2;

    const feedback = {
        correto: "bi bi-check2",
        parcial: "bi bi-check2-circle",
        trocar: "bi bi-arrow-repeat",
        errado: "bi bi-ban"
    }

    const [dados, setDados] = useState(null);
    const [buffer, setBuffer] = useState([]);
    const [combinacoes, setCombinacoes] = useState([]);
    const [itensAleatorios, setItensAleatorios] = useState([]);
    const [itemSelecionado, setItemSelecionado] = useState([]);
    const [conjunto, setConjunto] = useState(1);
    const [contadorTentativas, setContadorTentativas] = useState(tentativas);

    
    useEffect(() => {
        fetch('/dados.json')
            .then(res => res.json())
            .then(data => {
                setDados(data);
        });

        const bufferInicial = Array.from({ length: tentativas }, () =>
            Array.from({ length: totalItensSuperior }, () => ({
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

    const selecionarItem = (item) => {
        setItemSelecionado(prev => {
            const novo = [...prev, item];

            if (novo.length === 2) {

                const resultado = dados.combinacoes.find(c =>
                    c.ingredientes.every(i =>
                        novo.includes(i)
                    )
                );

                setBuffer(prevBuffer => {
                    const novoBuffer = [...prevBuffer];

                    const linha = conjunto - 1;
                    const coluna = novoBuffer[linha].findIndex(item => item.combinacao === null);

                    novoBuffer[linha][coluna] = {
                        ...novoBuffer[linha][coluna],
                        combinacao: resultado,
                        icone: null
                    };

                    return novoBuffer;
                });

                return [];
            }

            return novo;
        });
    };

    const verificarCombinacao = () => {
        const linhaIndex = conjunto - 1;
        const linha = buffer[linhaIndex];
        const usados = [];
        const icones = [];

        if (contadorTentativas === 0){
            alert("tentativas esgotadas");
            return;
        }

        // Verifica se todos os espaços estão preenchidos
        if (!linha.every(item => item.combinacao !== null)) {
            alert("Preencha todos os itens antes de verificar!");
            return;
        }

        console.log(contadorTentativas)

        // verifica se as tentativas foram esgotadas
        //if (!buffer.some(linha => linha.some(item => !item.combinacao))) {
            //alert("tentativas esgotadas");
        //}

        const nomes = linha.map(item => item.combinacao.resultado?.nome);

        if (nomes.every((nome, i) => combinacoes[i]?.nome === nome)) {
            setBuffer(prev => {
                const novo = [...prev];

                novo[linhaIndex] = novo[linhaIndex].map(item => ({
                    ...item,
                    icone: feedback.correto
                }));

                return novo;
            });

            alert("fim de jogo, combinação correta");
            return;
        }

        // Posição correta
        nomes.forEach((nome, i) => {
            if (combinacoes[i]?.nome === nome) {
                icones[i] = feedback.correto;
                usados[i] = true;
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
            } else if (combinacoes.some(c => c.nome === nome)) {
                icones[i] = feedback.parcial;
            } else {
                icones[i] = feedback.errado;
            }
        });

        setBuffer(prev => {
            const novo = [...prev];

            novo[linhaIndex] = novo[linhaIndex].map((item, i) => ({
                ...item,
                icone: icones[i]
            }));

            return novo;
        });

        setConjunto(prev => prev + 1);
        setContadorTentativas(prev => prev - 1);
    };

    const LimparCombinacao = () => {
        setBuffer(prevBuffer => {
            const novoBuffer = [...prevBuffer];

            novoBuffer[conjunto - 1] = Array.from({ length: totalItensSuperior }, () => ({
                combinacao: null,
                icone: null
            }));

            return novoBuffer;
        });
    };

    if (!dados) return <p>Carregando...</p>;
    
    return (
        <>
            <div className="display">
                {buffer.slice(0, conjunto).map((linha, i) => (
                    <div key={i} className="resultado">
                        {linha.map((item, j) => (
                            <div key={j} id={j}>
                                {item.combinacao ? (
                                    <>
                                        <Image
                                            src={item.combinacao.resultado.imagem}
                                            width={50}
                                            height={50}
                                            alt={item.combinacao.resultado.nome}
                                        />
                                        <p>
                                            {item.combinacao.resultado.nome}
                                            <i className={item.icone}></i>
                                        </p>
                                    </>
                                ) : (
                                    <p>vazio</p>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                <div className="item">
                    <button 
                        type="button" 
                        class="btn btn-danger"
                        onClick={LimparCombinacao}
                    >Limpar</button>

                    {itensAleatorios.map((elemento, index) => (
                        <div 
                            key={index} 
                            onClick={() => selecionarItem(elemento.nome)}
                        >
                            <Image
                                src={elemento.imagem}
                                width={50}
                                height={50}
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
            </div>
        </>
    )
}