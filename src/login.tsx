export default function Login() {
	return (
		<section class="container mx-auto px-4 py-16 text-center">
			<div class="bg-white shadow-md rounded-lg overflow-hidden">
				<div class="md:flex">
					<div
						class="md:w-1/2 bg-cover bg-center"
						style="background-image: url('https://via.placeholder.com/400'); height: 300px;"
					/>

					<div class="md:w-1/2 p-8">
						<h2 class="text-3xl font-bold text-gray-800 mb-4">
							Bienvenue sur FaceX
						</h2>
						<p class="text-gray-600 mb-6">
							Bienvenue sur notre plateforme de prise de présence automatisée.
							Ce projet innovant repose sur l’utilisation de caméras
							intelligentes associées à un algorithme de reconnaissance faciale
							avancé pour assurer une gestion précise et rapide des présences.
							Notre système détecte automatiquement chaque individu dans le
							champ de la caméra, analyse et reconnaît les visages de manière
							sécurisée, permettant ainsi une vérification sans intervention
							humaine. Conçu pour s'intégrer dans divers contextes, notre projet
							facilite les processus administratifs dans les entreprises, les
							écoles et tout environnement nécessitant une gestion fiable des
							présences. Éliminez les registres manuels et les badges physiques,
							et bénéficiez d'une solution moderne et efficace.
						</p>
						<a
							href="https://github.com/FaceX-Integration-Project-2024/FaceX/tree/main"
							class="inline-flex items-center bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
						>
							Github
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
