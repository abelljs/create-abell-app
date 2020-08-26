# Deployment

You can either Deploy from a GitHub Repository or Deploy folder manually.

## Deploy with GitHub

### 1. Create GitHub Repository

- Create a GitHub repository on your GitHub account
- Push the content from this project to your repository.
```
git init
git remote add origin <your-github-project-url>
git add .
git commit -m "init"
git push origin master # Replace 'master' with your default branch name
```

### 2. Create Project on Netlify (or other hosting platform)

- Go to [Netlify](https://netlify.com/) (or any other hosting platform you like)
- Create new project/site from your new GitHub repository to the project.

### 3. Set Deploy Options

Set deploy options to -<br/><br/>
**Build Command:** npm run build<br/>
**Publish Directory:** dist

## Deploy Folder

- Open Netlify and login to your account.
- Run `npm run build` from root of your project.
- Drag-Drop new `dist` directory to Netlify window.

