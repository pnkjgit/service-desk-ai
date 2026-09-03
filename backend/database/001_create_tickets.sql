CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(50) NOT NULL DEFAULT 'open',

    priority VARCHAR(50) NOT NULL DEFAULT 'medium',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);