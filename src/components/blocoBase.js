import Image from "next/image"

export default function BlocoBase({
    limparCombinacao,
    itensAleatorios,
    itemAtivoId,
    verificarCombinacao,
    selecionarItem
}) {
    return (
        <div className="item">
            <button 
                type="button" 
                class="btn btn-danger"
                onClick={limparCombinacao}
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
                        draggable={false}
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
    )
}
