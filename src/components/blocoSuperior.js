import Image from "next/image";

export default function BlocoSuperior({
    buffer,
    conjunto,
    totalItensSuperior,
    selecaoSuperior,
    setSelecaoSuperior,
    limparCombinacaoEspecifica
}) {
    return (
        <div className="display scroll">
            {buffer.slice(0, conjunto).map((linha, i) => (
                <div key={i} className="resultado">
                    {linha.map((item, j) => (
                        <div 
                            key={j} 
                            className={item.icone ? `border-${item.icone.split(' ').pop().split('-').pop()}` : ""}
                            style={{ 
                                "--colunas": `${100 / totalItensSuperior}%`,
                                opacity: item.isActive ? '0.5' : '1',
                                cursor: item.icone ? '' : 'pointer',
                                border: (selecaoSuperior.estado && selecaoSuperior.coluna === j && !item.icone) ? 
                                '4px solid #6c757d' 
                                : 
                                `${item.isActive ? '2px solid' : '2px dashed'} black`
                            }}
                            onClick={() => {
                                if (!item.icone) {
                                    setSelecaoSuperior((prev) => ({
                                        estado: !prev.estado, 
                                        coluna: j
                                    }));
                                }
                            }}
                        >
                            {item.combinacao ? (
                                <>
                                    <Image
                                        src={item.combinacao.resultado.imagem}
                                        priority
                                        draggable={false}
                                        width={64}
                                        height={64}
                                        alt={item.combinacao.resultado.nome}
                                    />
                                    <p>
                                        {item.combinacao.resultado.nome}
                                        <i className={item.icone}></i>
                                    </p>
                                    {item.icone ? 
                                        null 
                                        : 
                                        <button 
                                            type="button" 
                                            className="btn-close"
                                            aria-label="Close"
                                            style={{
                                                top: selecaoSuperior.estado && selecaoSuperior.coluna === j ? '-5px' : '-4px',
                                                right: selecaoSuperior.estado && selecaoSuperior.coluna === j ? '-6px' : '-4px'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                limparCombinacaoEspecifica(j);
                                            }}
                                        ></button>
                                    }
                                </>
                            ) : (
                                <p>Vazio</p>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
