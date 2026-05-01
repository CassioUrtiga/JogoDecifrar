export default function Descricao({
    alert,
    feedback,
    contadorTentativas
}) {
    return (
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
                <p><i className={feedback.correto}></i> Correto</p>
                <p><i className={feedback.parcial}></i> Parcialmente correto</p>
                <p><i className={feedback.trocar}></i> Posição incorreta</p>
                <p><i className={feedback.errado}></i> Incorreto</p>
            </div>
        </div>
    )
}
