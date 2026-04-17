import Head from 'next/head'
import Jogo from '@/templates/jogo'

export default function Principal() {
  return (
    <>
      <Head>
        <title>Tela inicial</title>
      </Head>

      <Jogo />
    </>
  )
}