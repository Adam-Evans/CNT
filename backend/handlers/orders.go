package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/Adam-Evans/CNT/backend/database"
	"github.com/Adam-Evans/CNT/backend/models"
	"github.com/gin-gonic/gin"
)

// CreateOrder creates a new order
func CreateOrder(c *gin.Context) {
	var req models.OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get current nugget price from config
	db := database.GetDB()
	var priceStr string
	err := db.QueryRow("SELECT value FROM config WHERE key = 'nugget_price'").Scan(&priceStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get nugget price"})
		return
	}

	price, _ := strconv.ParseFloat(priceStr, 64)
	totalCost := price * float64(req.Quantity)

	result, err := db.Exec(`
		INSERT INTO orders (customer_name, broker_id, quantity, cost, is_paid)
		VALUES (?, ?, ?, ?, 0)
	`, req.CustomerName, req.BrokerID, req.Quantity, totalCost)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	orderID, _ := result.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"order_id": orderID,
		"message":  "Order created successfully",
		"cost":     totalCost,
	})
}

// GetMyOrders returns all orders for the current broker
func GetMyOrders(c *gin.Context) {
	userID := c.GetInt("user_id")

	db := database.GetDB()
	rows, err := db.Query(`
		SELECT id, customer_name, broker_id, quantity, cost, is_paid, created_at
		FROM orders
		WHERE broker_id = ?
		ORDER BY created_at DESC
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		err := rows.Scan(
			&order.ID, &order.CustomerName, &order.BrokerID,
			&order.Quantity, &order.Cost, &order.IsPaid, &order.CreatedAt,
		)
		if err != nil {
			continue
		}
		orders = append(orders, order)
	}

	c.JSON(http.StatusOK, orders)
}

// GetAllOrders (Super Admin only) returns all orders in the system
func GetAllOrders(c *gin.Context) {
	db := database.GetDB()
	rows, err := db.Query(`
		SELECT o.id, o.customer_name, o.broker_id, o.quantity, o.cost, o.is_paid, o.created_at,
		       u.username
		FROM orders o
		JOIN users u ON o.broker_id = u.id
		ORDER BY o.created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	type OrderWithBroker struct {
		models.Order
		BrokerUsername string `json:"broker_username"`
	}

	var orders []OrderWithBroker
	for rows.Next() {
		var order OrderWithBroker
		err := rows.Scan(
			&order.ID, &order.CustomerName, &order.BrokerID,
			&order.Quantity, &order.Cost, &order.IsPaid, &order.CreatedAt,
			&order.BrokerUsername,
		)
		if err != nil {
			continue
		}
		orders = append(orders, order)
	}

	c.JSON(http.StatusOK, orders)
}

// UpdateOrder (Super Admin only) updates an order's payment status
func UpdateOrder(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var req struct {
		IsPaid bool `json:"is_paid"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetDB()
	_, err = db.Exec("UPDATE orders SET is_paid = ? WHERE id = ?", req.IsPaid, orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated successfully"})
}

// GetBrokerStats (Super Admin only) returns statistics for each broker
func GetBrokerStats(c *gin.Context) {
	db := database.GetDB()
	rows, err := db.Query(`
		SELECT u.id, u.username, bp.name,
		       COUNT(o.id) as order_count,
		       COALESCE(SUM(o.cost), 0) as total_revenue,
		       COALESCE(SUM(CASE WHEN o.is_paid = 1 THEN o.cost ELSE 0 END), 0) as paid_revenue
		FROM users u
		LEFT JOIN broker_profiles bp ON u.id = bp.user_id
		LEFT JOIN orders o ON u.id = o.broker_id
		WHERE u.is_super_admin = 0
		GROUP BY u.id, u.username, bp.name
		ORDER BY total_revenue DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	type BrokerStats struct {
		BrokerID     int     `json:"broker_id"`
		Username     string  `json:"username"`
		Name         string  `json:"name"`
		OrderCount   int     `json:"order_count"`
		TotalRevenue float64 `json:"total_revenue"`
		PaidRevenue  float64 `json:"paid_revenue"`
	}

	var stats []BrokerStats
	for rows.Next() {
		var stat BrokerStats
		var name sql.NullString
		err := rows.Scan(
			&stat.BrokerID, &stat.Username, &name,
			&stat.OrderCount, &stat.TotalRevenue, &stat.PaidRevenue,
		)
		if err != nil {
			continue
		}
		if name.Valid {
			stat.Name = name.String
		}
		stats = append(stats, stat)
	}

	c.JSON(http.StatusOK, stats)
}
