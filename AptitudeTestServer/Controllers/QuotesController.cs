using AptitudeTestServer.Data;
using AptitudeTestServer.Models;
using AptitudeTestServer.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Eventing.Reader;
using System.Dynamic;
using System.Threading.Tasks;

namespace AptitudeTestServer.Controllers;

[ApiController]
[Route("api/quotes")]
public class QuotesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<QuotesController> _logger;
    
    public QuotesController(ApplicationDbContext context, ILogger<QuotesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var quotes = await _context.Quotes
            .Select(q => new QuoteDto(
                q.Id,
                q.Name,
                q.Premium,
                q.State.Rate,
                q.Tiv,
                q.State.Abbreviation,
                q.State.Id))
            .ToListAsync();
        return Ok(quotes);
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var quote = await _context.Quotes
                .Select(q => new QuoteDto(
                    q.Id,
                    q.Name,
                    q.Premium,
                    q.State.Rate,
                    q.Tiv,
                    q.State.Abbreviation,
                    q.State.Id))
                .FirstOrDefaultAsync(q => q.Id == id);
        return Ok(quote);
    }

    // Implement POST
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateQuote request)
    {
        var state = await _context.States.FindAsync(request.StateId);
        if (state == null) return BadRequest("State not found");

        var premium = (request.Tiv * state.Rate) / 100;

        var quote = new Quote
        {
            Name = request.Name,
            Tiv = request.Tiv,
            StateId = request.StateId,
            Premium = premium
        };

        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();

        var response = new QuoteDto(
            quote.Id,
            quote.Name,
            quote.Premium,
            state.Rate,
            quote.Tiv,
            state.Abbreviation,
            state.Id
        );

        _logger.LogInformation("Created quote {QuoteId} for {Name}", quote.Id, quote.Name);


        return CreatedAtAction(nameof(GetById), new { id = quote.Id }, response);
    }
    // Implement PUT
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateQuote request)
    {
        var quote = await _context.Quotes.FindAsync(id);
        if (quote == null) return NotFound();

        var state = await _context.States.FindAsync(request.StateId);
        if (state == null) return BadRequest("State not found");

        quote.Name = request.Name;
        quote.Tiv = request.Tiv;
        quote.StateId = request.StateId;
        quote.Premium = (request.Tiv * state.Rate) / 100;

        await _context.SaveChangesAsync();

        var response = new QuoteDto(
            quote.Id,
            quote.Name,
            quote.Premium,
            state.Rate,
            quote.Tiv,
            state.Abbreviation,
            state.Id
        );

        _logger.LogInformation("Updated quote {QuoteId}", quote.Id);

        return Ok(response);
    }

    // To supply a select / dropdown?
    [HttpGet("states")]
    public async Task<IActionResult> GetAllStates()
    {
        var states = await _context.States
            .OrderBy(state => state.Abbreviation)
            .Select(state => new StateDto(state.Id, state.Abbreviation, state.Rate))
            .ToListAsync();
        return Ok(states);
    }
}