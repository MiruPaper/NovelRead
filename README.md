# Novel Reader Web Application

A full-stack web application for reading novels online, built with Next.js, Express, and MongoDB.

## Features

- Browse available novels
- Read chapters with a clean, distraction-free interface
- Navigate between chapters easily
- View both main story chapters and side stories
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Node.js/Express with TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd novel-reader
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Set up environment variables:

Create a `.env` file in the backend directory with the following content:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Seed the database with sample data:
```bash
# In the backend directory
npm run build
node dist/scripts/seedDatabase.js
```

## Running the Application

1. Start the backend server:
```bash
# In the backend directory
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
# In the root directory
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
novel-reader/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── novel/        # Novel-related pages
│   │   └── page.tsx      # Home page
│   └── ...
├── backend/               # Backend source code
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── scripts/      # Utility scripts
│   └── ...
└── ...
```

## API Endpoints

- `GET /api/novels` - Get all novels
- `GET /api/novels/:id` - Get a specific novel with its chapters
- `GET /api/chapters/:id` - Get a specific chapter
- `POST /api/novels` - Create a new novel
- `POST /api/chapters` - Create a new chapter
- `PUT /api/novels/:id` - Update a novel
- `PUT /api/chapters/:id` - Update a chapter
- `DELETE /api/novels/:id` - Delete a novel
- `DELETE /api/chapters/:id` - Delete a chapter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. #   N o v e l R e a d  
 #   N o v e l R e a d  
 