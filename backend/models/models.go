package models

import "time"

type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"`
	IsSuperAdmin bool      `json:"is_super_admin" db:"is_super_admin"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type BrokerProfile struct {
	ID               int       `json:"id" db:"id"`
	UserID           int       `json:"user_id" db:"user_id"`
	Name             string    `json:"name" db:"name"`
	Bio              string    `json:"bio" db:"bio"`
	MissionStatement string    `json:"mission_statement" db:"mission_statement"`
	Testimonials     string    `json:"testimonials" db:"testimonials"`
	ProfilePicture   string    `json:"profile_picture" db:"profile_picture"`
	ShowAIContent    bool      `json:"show_ai_content" db:"show_ai_content"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type Order struct {
	ID           int       `json:"id" db:"id"`
	CustomerName string    `json:"customer_name" db:"customer_name"`
	BrokerID     int       `json:"broker_id" db:"broker_id"`
	Quantity     int       `json:"quantity" db:"quantity"`
	Cost         float64   `json:"cost" db:"cost"`
	IsPaid       bool      `json:"is_paid" db:"is_paid"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type Config struct {
	Key       string    `json:"key" db:"key"`
	Value     string    `json:"value" db:"value"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type AICache struct {
	BrokerID          int       `json:"broker_id" db:"broker_id"`
	PropagandaContent string    `json:"propaganda_content" db:"propaganda_content"`
	BioHash           string    `json:"bio_hash" db:"bio_hash"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
}

// Request/Response DTOs
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type BrokerProfileUpdate struct {
	Name             string `json:"name"`
	Bio              string `json:"bio"`
	MissionStatement string `json:"mission_statement"`
	Testimonials     string `json:"testimonials"`
	ProfilePicture   string `json:"profile_picture"`
}

type OrderRequest struct {
	CustomerName string `json:"customer_name" binding:"required"`
	BrokerID     int    `json:"broker_id" binding:"required"`
	Quantity     int    `json:"quantity" binding:"required,min=1,max=10"`
}

type ConfigUpdate struct {
	NuggetPrice       string `json:"nugget_price"`
	EventEndDate      string `json:"event_end_date"`
	OrdersClosingDate string `json:"orders_closing_date"`
	ShowAIContent     string `json:"show_ai_content"`
}

type SiteConfig struct {
	Key       string    `json:"key" db:"key"`
	Value     string    `json:"value" db:"value"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type SiteConfigUpdate struct {
	CEOName  string `json:"ceo_name"`
	CEOTitle string `json:"ceo_title"`
	CEOImage string `json:"ceo_image"`
	CEOQuote string `json:"ceo_quote"`
}

type BrokerAIContentUpdate struct {
	ShowAIContent bool `json:"show_ai_content"`
}

type BrokerWithProfile struct {
	User
	Profile *BrokerProfile `json:"profile,omitempty"`
}

type PropagandaResponse struct {
	Content string `json:"content"`
}
