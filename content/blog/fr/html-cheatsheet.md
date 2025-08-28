---
title: "Aide-mémoire HTML"
date: "2012-03-15"
excerpt: "Un guide complet des éléments HTML essentiels pour le développement web."
---

# Aide-mémoire HTML

Un guide complet des éléments HTML essentiels pour le développement web.

## Structure de Base

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Titre de la Page</title>
</head>
<body>
    <!-- Le contenu va ici -->
</body>
</html>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<strong>Aperçu :</strong> Structure de base du document HTML
</div>

## Balises de Titre

```html
<h1>Titre Principal</h1>
<h2>Titre de Section</h2>
<h3>Titre de Sous-section</h3>
<h4>Titre de Niveau 4</h4>
<h5>Titre de Niveau 5</h5>
<h6>Titre de Niveau 6</h6>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<h1>Titre Principal</h1>
<h2>Titre de Section</h2>
<h3>Titre de Sous-section</h3>
<h4>Titre de Niveau 4</h4>
<h5>Titre de Niveau 5</h5>
<h6>Titre de Niveau 6</h6>
</div>

## Paragraphes et Texte

```html
<p>Ceci est un paragraphe.</p>
<br>
<strong>Texte en gras</strong>
<em>Texte en italique</em>
<u>Texte souligné</u>
<mark>Texte surligné</mark>
<small>Petit texte</small>
<del>Texte supprimé</del>
<ins>Texte inséré</ins>
<sub>Indice</sub>
<sup>Exposant</sup>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<p>Ceci est un paragraphe.</p>
<br>
<strong>Texte en gras</strong><br>
<em>Texte en italique</em><br>
<u>Texte souligné</u><br>
<mark>Texte surligné</mark><br>
<small>Petit texte</small><br>
<del>Texte supprimé</del><br>
<ins>Texte inséré</ins><br>
H<sub>2</sub>O<br>
X<sup>2</sup>
</div>

## Liens

```html
<a href="https://example.com">Lien externe</a>
<a href="mailto:someone@example.com">Lien email</a>
<a href="tel:+1234567890">Lien téléphone</a>
<a href="#section1">Lien ancre interne</a>
<a href="https://example.com" target="_blank">Ouvrir dans un nouvel onglet</a>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<a href="https://example.com">Lien externe</a><br>
<a href="mailto:someone@example.com">Lien email</a><br>
<a href="tel:+1234567890">Lien téléphone</a><br>
<a href="#section1">Lien ancre interne</a><br>
<a href="https://example.com" target="_blank">Ouvrir dans un nouvel onglet</a>
</div>

## Listes

```html
<!-- Liste non ordonnée -->
<ul>
    <li>Premier élément</li>
    <li>Deuxième élément</li>
    <li>Troisième élément</li>
</ul>

<!-- Liste ordonnée -->
<ol>
    <li>Premier</li>
    <li>Deuxième</li>
    <li>Troisième</li>
</ol>

<!-- Liste de définitions -->
<dl>
    <dt>HTML</dt>
    <dd>Langage de Balisage HyperTexte</dd>
    <dt>CSS</dt>
    <dd>Feuilles de Style en Cascade</dd>
</dl>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<ul>
    <li>Premier élément</li>
    <li>Deuxième élément</li>
    <li>Troisième élément</li>
</ul>

<ol>
    <li>Premier</li>
    <li>Deuxième</li>
    <li>Troisième</li>
</ol>

<dl>
    <dt>HTML</dt>
    <dd>Langage de Balisage HyperTexte</dd>
    <dt>CSS</dt>
    <dd>Feuilles de Style en Cascade</dd>
</dl>
</div>

## Images

```html
<img src="image.jpg" alt="Description de l'image" width="300" height="200">
<img src="image.jpg" alt="Image responsive" style="max-width: 100%; height: auto;">
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<img src="https://via.placeholder.com/300x200" alt="Image d'exemple" style="max-width: 100%; height: auto;">
</div>

## Tableaux

```html
<table border="1">
    <thead>
        <tr>
            <th>Nom</th>
            <th>Âge</th>
            <th>Ville</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Pierre</td>
            <td>25</td>
            <td>Paris</td>
        </tr>
        <tr>
            <td>Marie</td>
            <td>30</td>
            <td>Lyon</td>
        </tr>
    </tbody>
</table>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="padding: 8px; background-color: #f0f0f0;">Nom</th>
            <th style="padding: 8px; background-color: #f0f0f0;">Âge</th>
            <th style="padding: 8px; background-color: #f0f0f0;">Ville</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px;">Pierre</td>
            <td style="padding: 8px;">25</td>
            <td style="padding: 8px;">Paris</td>
        </tr>
        <tr>
            <td style="padding: 8px;">Marie</td>
            <td style="padding: 8px;">30</td>
            <td style="padding: 8px;">Lyon</td>
        </tr>
    </tbody>
</table>
</div>

## Éléments de Formulaire

```html
<form>
    <label for="name">Nom :</label>
    <input type="text" id="name" name="name" placeholder="Entrez votre nom">
    
    <label for="email">Email :</label>
    <input type="email" id="email" name="email">
    
    <label for="password">Mot de passe :</label>
    <input type="password" id="password" name="password">
    
    <label for="age">Âge :</label>
    <input type="number" id="age" name="age" min="1" max="120">
    
    <label for="message">Message :</label>
    <textarea id="message" name="message" rows="4" cols="50"></textarea>
    
    <label for="country">Pays :</label>
    <select id="country" name="country">
        <option value="fr">France</option>
        <option value="ca">Canada</option>
        <option value="be">Belgique</option>
    </select>
    
    <input type="checkbox" id="subscribe" name="subscribe">
    <label for="subscribe">S'abonner à la newsletter</label>
    
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">Masculin</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">Féminin</label>
    
    <button type="submit">Envoyer</button>
    <button type="reset">Réinitialiser</button>
</form>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<form>
    <div style="margin: 5px 0;">
        <label for="name">Nom :</label><br>
        <input type="text" id="name" name="name" placeholder="Entrez votre nom" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="email">Email :</label><br>
        <input type="email" id="email" name="email" style="margin-top: 2px;">
    </div>
    
    <div style="margin: 5px 0;">
        <label for="message">Message :</label><br>
        <textarea id="message" name="message" rows="3" cols="30" style="margin-top: 2px;"></textarea>
    </div>
    
    <div style="margin: 5px 0;">
        <label for="country">Pays :</label><br>
        <select id="country" name="country" style="margin-top: 2px;">
            <option value="fr">France</option>
            <option value="ca">Canada</option>
            <option value="be">Belgique</option>
        </select>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="checkbox" id="subscribe" name="subscribe">
        <label for="subscribe">S'abonner à la newsletter</label>
    </div>
    
    <div style="margin: 5px 0;">
        <input type="radio" id="male" name="gender" value="male">
        <label for="male">Masculin</label>
        <input type="radio" id="female" name="gender" value="female">
        <label for="female">Féminin</label>
    </div>
    
    <div style="margin: 10px 0;">
        <button type="button">Envoyer</button>
        <button type="button">Réinitialiser</button>
    </div>
</form>
</div>

## Éléments Sémantiques

```html
<header>En-tête du site web</header>
<nav>Navigation</nav>
<main>Contenu principal</main>
<section>Section</section>
<article>Article ou contenu indépendant</article>
<aside>Barre latérale ou informations complémentaires</aside>
<footer>Pied de page du site web</footer>
<figure>
    <img src="image.jpg" alt="description">
    <figcaption>Légende de l'image</figcaption>
</figure>
<details>
    <summary>Cliquer pour développer</summary>
    <p>Le contenu caché s'affichera ici.</p>
</details>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<header style="background-color: #e0e0e0; padding: 10px;">En-tête du site web</header>
<nav style="background-color: #d0d0d0; padding: 10px;">Navigation</nav>
<main style="background-color: #f0f0f0; padding: 10px;">Contenu principal</main>
<section style="background-color: #e5e5e5; padding: 10px;">Section</section>
<article style="background-color: #f5f5f5; padding: 10px;">Article ou contenu indépendant</article>
<aside style="background-color: #e8e8e8; padding: 10px;">Barre latérale ou informations complémentaires</aside>
<footer style="background-color: #e0e0e0; padding: 10px;">Pied de page du site web</footer>
<details style="margin: 10px 0;">
    <summary>Cliquer pour développer</summary>
    <p>Le contenu caché s'affichera ici.</p>
</details>
</div>

## Multimédia

```html
<!-- Vidéo -->
<video controls width="300">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Votre navigateur ne supporte pas l'élément vidéo.
</video>

<!-- Audio -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    Votre navigateur ne supporte pas l'élément audio.
</audio>

<!-- Intégration -->
<iframe src="https://www.example.com" width="300" height="200"></iframe>
```

<div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
<video controls width="300" style="background-color: #000;">
    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
    Votre navigateur ne supporte pas l'élément vidéo.
</video>
<br><br>
<audio controls>
    <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
    Votre navigateur ne supporte pas l'élément audio.
</audio>
</div>

Cet aide-mémoire couvre les éléments HTML les plus utilisés dans le développement web. Pratiquez l'utilisation de ces éléments pour améliorer vos compétences en développement web !