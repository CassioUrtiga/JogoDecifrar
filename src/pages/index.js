export async function getServerSideProps(context) {
  // Redirecionar para a página principal
  return {
    redirect: {
      destination: '/principal',
      permanent: true,
    },
  };
}

const Home = () => null;
export default Home;
