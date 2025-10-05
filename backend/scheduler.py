from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def distribute_profits(db):
    """Distribute profits to active investments every 6 hours"""
    try:
        now = datetime.utcnow()
        
        # Find investments due for profit distribution
        investments = await db.investments.find({
            "status": "active",
            "next_profit_at": {"$lte": now}
        }).to_list(None)
        
        logger.info(f"Processing {len(investments)} investments for profit distribution")
        
        for investment in investments:
            user_id = investment["user_id"]
            profit_per_cycle = investment["profit_per_cycle"]
            completed_cycles = investment["completed_cycles"]
            total_cycles = investment["total_cycles"]
            
            # Check if investment should be completed
            if completed_cycles + 1 >= total_cycles:
                # Final profit distribution
                await db.users.update_one(
                    {"id": user_id},
                    {
                        "$inc": {
                            "brl_balance": profit_per_cycle,
                            "available_for_withdrawal": profit_per_cycle,
                            "total_returns": profit_per_cycle
                        }
                    }
                )
                
                # Complete the investment and return principal
                await db.investments.update_one(
                    {"id": investment["id"]},
                    {
                        "$set": {
                            "status": "completed",
                            "completed_cycles": total_cycles,
                            "last_profit_at": now
                        }
                    }
                )
                
                # Return principal to user
                await db.users.update_one(
                    {"id": user_id},
                    {
                        "$inc": {
                            "brl_balance": investment["amount"],
                            "available_for_withdrawal": investment["amount"],
                            "total_invested": -investment["amount"]
                        }
                    }
                )
                
                # Create transaction record
                transaction = {
                    "id": f"txn_{user_id}_{int(datetime.utcnow().timestamp())}",
                    "user_id": user_id,
                    "type": "profit",
                    "amount": profit_per_cycle,
                    "status": "completed",
                    "notes": f"Lucro final - {investment['plan_name']}",
                    "created_at": now,
                    "processed_at": now
                }
                await db.transactions.insert_one(transaction)
                
                logger.info(f"Investment {investment['id']} completed for user {user_id}")
            else:
                # Regular profit distribution
                await db.users.update_one(
                    {"id": user_id},
                    {
                        "$inc": {
                            "brl_balance": profit_per_cycle,
                            "available_for_withdrawal": profit_per_cycle,
                            "total_returns": profit_per_cycle
                        }
                    }
                )
                
                # Update investment
                next_profit = now + timedelta(hours=6)
                await db.investments.update_one(
                    {"id": investment["id"]},
                    {
                        "$set": {
                            "completed_cycles": completed_cycles + 1,
                            "last_profit_at": now,
                            "next_profit_at": next_profit
                        }
                    }
                )
                
                # Create transaction record
                transaction = {
                    "id": f"txn_{user_id}_{int(datetime.utcnow().timestamp())}",
                    "user_id": user_id,
                    "type": "profit",
                    "amount": profit_per_cycle,
                    "status": "completed",
                    "notes": f"Lucro automático - {investment['plan_name']} (Ciclo {completed_cycles + 1}/{total_cycles})",
                    "created_at": now,
                    "processed_at": now
                }
                await db.transactions.insert_one(transaction)
                
                logger.info(f"Profit distributed for investment {investment['id']}")
        
        logger.info(f"Profit distribution completed. Processed {len(investments)} investments.")
    except Exception as e:
        logger.error(f"Error in profit distribution: {str(e)}")

def start_scheduler(db):
    """Start the APScheduler for automated tasks"""
    scheduler = AsyncIOScheduler()
    
    # Run profit distribution every 6 hours
    scheduler.add_job(
        distribute_profits,
        'interval',
        hours=6,
        args=[db],
        id='distribute_profits',
        replace_existing=True
    )
    
    # Also run every minute to check for any missed distributions
    scheduler.add_job(
        distribute_profits,
        'interval',
        minutes=1,
        args=[db],
        id='check_profits',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started successfully")
    
    return scheduler