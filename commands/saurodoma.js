module.exports = {
    name: 'saurodoma',
    description: 'Muestra cuánto tiempo queda para la siguiente noche en el juego.',
    execute(message) {
        const startDate = new Date('2024-11-17T21:00:00'); // Primera noche a las 21:00 en la hora local de la máquina
        const nightDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
        const dayDuration = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
        const cycleDuration = nightDuration + dayDuration; // Duración total de un ciclo (30 min de noche + 2 horas de día)

        let nextNightTime = new Date(startDate);

        // Avanza al próximo ciclo de noche si ya pasó
        while (nextNightTime <= new Date()) {
            nextNightTime = new Date(nextNightTime.getTime() + cycleDuration);
        }

        // Calcula el tiempo restante
        const now = new Date();
        const timeDifference = nextNightTime - now; // Diferencia en milisegundos
        const totalMinutesLeft = Math.floor(timeDifference / 1000 / 60); // Total de minutos restantes

        const hoursLeft = Math.floor(totalMinutesLeft / 60);
        const remainingMinutes = totalMinutesLeft % 60;

        // Formatea la respuesta según el tiempo restante
        let response;
        if (hoursLeft > 0) {
            response = `La siguiente noche comienza en ${hoursLeft} horas y ${remainingMinutes} minutos.`;
        } else {
            response = `La siguiente noche comienza en ${remainingMinutes} minutos.`;
        }

        message.reply(response);
    },
};
