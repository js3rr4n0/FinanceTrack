import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transactions, summary } = await request.json();

    const totalTransactions = transactions.length;
    const expenses = transactions.filter((t: any) => t.type === 'expense');
    const avgExpense = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0) / expenses.length;
    
    const categoryTotals = expenses.reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0];

    let analysis = `📊 **ANÁLISIS FINANCIERO PERSONALIZADO**\n\n`;
    
    analysis += `**Estado General: ${summary.status === 'healthy' ? '💚 Saludable' : summary.status === 'warning' ? '⚠️ Precaución' : '🚨 Crítico'}**\n\n`;
    
    analysis += `**Resumen de Actividad:**\n`;
    analysis += `• Total de transacciones: ${totalTransactions}\n`;
    analysis += `• Gasto promedio: $${avgExpense.toFixed(2)}\n`;
    analysis += `• Balance actual: $${summary.balance.toFixed(2)}\n\n`;
    
    if (topCategory) {
      analysis += `**Categoría con más gasto:** ${topCategory[0]} ($${(topCategory[1] as number).toFixed(2)})\n\n`;
    }
    
    analysis += `**💡 Recomendaciones:**\n\n`;
    
    if (summary.status === 'critical') {
      analysis += `🚨 **Atención Urgente:**\n`;
      analysis += `• Tus gastos superan tus ingresos. Es momento de tomar acción.\n`;
      analysis += `• Identifica gastos no esenciales y elimínalos temporalmente.\n`;
      analysis += `• Considera generar ingresos adicionales (freelance, ventas).\n\n`;
    }
    
    if (summary.status === 'warning') {
      analysis += `⚠️ **Precaución:**\n`;
      analysis += `• Tu balance está ajustado. Mantén vigilancia sobre tus gastos.\n`;
      analysis += `• Crea un fondo de emergencia si aún no tienes uno.\n\n`;
    }
    
    if (topCategory && topCategory[0]) {
      analysis += `📌 **Sobre "${topCategory[0]}":**\n`;
      analysis += `• Es tu categoría de mayor gasto ($${(topCategory[1] as number).toFixed(2)}).\n`;
      analysis += `• Busca alternativas más económicas en esta área.\n`;
      analysis += `• Establece un presupuesto mensual específico.\n\n`;
    }
    
    analysis += `**🎯 Plan de Acción:**\n`;
    analysis += `1. Establece un presupuesto mensual para cada categoría\n`;
    analysis += `2. Usa la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro\n`;
    analysis += `3. Revisa tus gastos semanalmente usando esta app\n`;
    analysis += `4. Busca una transacción que puedas eliminar cada semana\n`;
    analysis += `5. Celebra cuando logres ahorrar más del 20% de tus ingresos\n\n`;
    
    analysis += `Recuerda: El primer paso para mejorar tus finanzas es tener consciencia de ellas. ¡Vas por buen camino! 💪`;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
  }
}
