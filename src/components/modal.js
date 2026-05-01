import Image from "next/image"

export default function Modal({
    modal,
    combinacoes
}) {
    return (
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
    )
}
