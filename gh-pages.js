import { publish } from 'gh-pages';

publish(
    'build', // path to public directory
    {
        branch: 'main',
        repo: 'https://github.com/sandmanlukas/sandmanlukas.github.io', // Update to point to your repository  
        user: {
            name: 'Lukas Sandman', // update to use your name
            email: 'sandmanlukas@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)